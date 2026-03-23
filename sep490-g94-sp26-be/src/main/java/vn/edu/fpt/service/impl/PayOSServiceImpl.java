package vn.edu.fpt.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import vn.edu.fpt.config.PayOSProperties;
import vn.edu.fpt.dto.request.payment.CreatePayOSPaymentRequest;
import vn.edu.fpt.dto.request.payment.PayOSWebhookRequest;
import vn.edu.fpt.dto.response.payment.PayOSCheckoutResponse;
import vn.edu.fpt.dto.response.payment.WebhookAcknowledgeResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.ContractRepository;
import vn.edu.fpt.service.PayOSService;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayOSServiceImpl implements PayOSService {

    private static final long ORDER_CODE_FACTOR = 1_000_000L;

    private final ContractRepository contractRepository;
    private final PayOSProperties payOSProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final PayOS payOS;

    private final Set<Long> processedWebhookOrders = ConcurrentHashMap.newKeySet();

    @Override
    public PayOSCheckoutResponse createPaymentLink(CreatePayOSPaymentRequest request) {
        // validate request
        validatePayOSConfig();

        Contract contract = contractRepository.findByIdAndStatus(request.getContractId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        if (contract.getContractState() == ContractState.CANCELLED || contract.getContractState() == ContractState.LIQUIDATED) {
            throw new AppException(ERROR_CODE.PAYMENT_INVALID_STATE);
        }

        String returnUrl = org.springframework.util.StringUtils.hasText(request.getReturnUrl())
                ? request.getReturnUrl() : payOSProperties.getReturnUrl();
        String cancelUrl = org.springframework.util.StringUtils.hasText(request.getCancelUrl())
                ? request.getCancelUrl() : payOSProperties.getCancelUrl();

        if (!org.springframework.util.StringUtils.hasText(returnUrl) || !org.springframework.util.StringUtils.hasText(cancelUrl)) {
            throw new AppException(ERROR_CODE.PAYMENT_CONFIG_MISSING, ": returnUrl/cancelUrl");
        }



        long orderCode = buildOrderCode(contract.getId());
        String signatureData = "amount=" + request.getAmount()
                + "&cancelUrl=" + cancelUrl
                + "&description=" + request.getDescription()
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;

        Map<String, Object> body = new HashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", request.getAmount());
        body.put("description", request.getDescription());
        body.put("returnUrl", returnUrl);
        body.put("cancelUrl", cancelUrl);
        body.put("signature", hmacSha256(signatureData, payOSProperties.getChecksumKey()));

        String endpoint = payOSProperties.getBaseUrl() + payOSProperties.getCreatePaymentPath();
        log.info("Creating PayOS payment link at: {}", endpoint);
        log.info("Request body: {}", body);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payOSProperties.getClientId());
            headers.set("x-api-key", payOSProperties.getApiKey());

            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            log.info("PayOS response status: {}", response.getStatusCode());
            log.info("PayOS response body: {}", response.getBody());

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                throw new AppException(ERROR_CODE.PAYMENT_PROVIDER_ERROR, ": empty response from PayOS");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
            if (data == null) {
                throw new AppException(ERROR_CODE.PAYMENT_PROVIDER_ERROR, ": data field not found in PayOS response");
            }

            String checkoutUrl = (String) data.get("checkoutUrl");
            if (!org.springframework.util.StringUtils.hasText(checkoutUrl)) {
                throw new AppException(ERROR_CODE.PAYMENT_PROVIDER_ERROR, ": checkoutUrl not found in PayOS response");
            }

            return PayOSCheckoutResponse.builder()
                    .orderCode(orderCode)
                    .checkoutUrl(checkoutUrl)
                    .paymentLinkId((String) data.get("paymentLinkId"))
                    .qrCode((String) data.get("qrCode"))
                    .build();
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to create PayOS payment link", ex);
            throw new AppException(ERROR_CODE.PAYMENT_PROVIDER_ERROR, ": " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public WebhookAcknowledgeResponse handleWebhook(Object request) {

        // 1. VERIFY SIGNATURE TRƯỚC
        WebhookData data;
        try {
            data = payOS.webhooks().verify(request);
        } catch (Exception e) {
            throw new AppException(ERROR_CODE.PAYMENT_INVALID_SIGNATURE);
        }

        if (data == null || data.getOrderCode() == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }

        Long orderCode = data.getOrderCode();

        // 2. CHECK SUCCESS
        if (!data.getDesc().equals("success")) {
            return WebhookAcknowledgeResponse.builder()
                    .processed(false)
                    .message("Payment not completed")
                    .build();
        }

        // 3. IDEMPOTENT
        if (!processedWebhookOrders.add(orderCode)) {
            return WebhookAcknowledgeResponse.builder()
                    .processed(true)
                    .message("Webhook already processed")
                    .build();
        }

        // 4. BUSINESS LOGIC
        int contractId = parseContractId(orderCode);
        Contract contract = contractRepository.findByIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        if (contract.getContractState() == ContractState.DRAFT) {
            contract.setContractState(ContractState.ACTIVE);
            contractRepository.save(contract);
        }

        log.info("webhook complete");

        return WebhookAcknowledgeResponse.builder()
                .processed(true)
                .message("Webhook processed")
                .build();
    }

//    private boolean verifyWebhookSignature(PayOSWebhookRequest request) {
//        if (!org.springframework.util.StringUtils.hasText(payOSProperties.getChecksumKey())) {
//            return true;
//        }
//
//        String providedSignature = request.getSignature();
//        if (!org.springframework.util.StringUtils.hasText(providedSignature) && request.getData() != null) {
//            providedSignature = request.getData().getSignature();
//        }
//        if (!org.springframework.util.StringUtils.hasText(providedSignature)) {
//            return false;
//        }
//
//        String dataToSign = "amount=" + request.getData().getAmount()
//                + "&description=" + request.getData().getDescription()
//                + "&orderCode=" + request.getData().getOrderCode();
//
//        String expectedSignature = hmacSha256(dataToSign, payOSProperties.getChecksumKey());
//        return expectedSignature.equalsIgnoreCase(providedSignature);
//    }
//
//    private boolean isWebhookSuccess(PayOSWebhookRequest request) {
//        if (Boolean.TRUE.equals(request.getSuccess())) {
//            return true;
//        }
//        if ("00".equals(request.getCode())) {
//            return true;
//        }
//        return request.getData() != null && "PAID".equalsIgnoreCase(request.getData().getStatus());
//    }

    private int parseContractId(long orderCode) {
        long contractId = orderCode / ORDER_CODE_FACTOR;
        if (contractId <= 0 || contractId > Integer.MAX_VALUE) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST, ": invalid orderCode");
        }
        return (int) contractId;
    }

    private long buildOrderCode(int contractId) {
        long suffix = System.currentTimeMillis() % ORDER_CODE_FACTOR;
        return contractId * ORDER_CODE_FACTOR + suffix;
    }

    private void validatePayOSConfig() {
        if (!org.springframework.util.StringUtils.hasText(payOSProperties.getClientId())
                || !org.springframework.util.StringUtils.hasText(payOSProperties.getApiKey())
                || !org.springframework.util.StringUtils.hasText(payOSProperties.getChecksumKey())
                || !org.springframework.util.StringUtils.hasText(payOSProperties.getBaseUrl())
                || !org.springframework.util.StringUtils.hasText(payOSProperties.getCreatePaymentPath())) {
            throw new AppException(ERROR_CODE.PAYMENT_CONFIG_MISSING);
        }
    }

    private String hmacSha256(String data, String secretKey) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            log.error("Failed to generate PayOS signature", ex);
            throw new AppException(ERROR_CODE.PAYMENT_PROVIDER_ERROR, ": cannot sign request");
        }
    }
}

