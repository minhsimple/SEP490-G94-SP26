package vn.edu.fpt.service.impl;

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
import vn.edu.fpt.dto.request.payos.CreatePayOSPaymentRequest;
import vn.edu.fpt.dto.request.task.TaskListCreateRequest;
import vn.edu.fpt.dto.response.payos.PayOSCheckoutResponse;
import vn.edu.fpt.dto.response.payos.WebhookAcknowledgeResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.entity.Invoice;
import vn.edu.fpt.entity.Payment;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.ContractRepository;
import vn.edu.fpt.respository.InvoiceRepository;
import vn.edu.fpt.respository.PaymentRepository;
import vn.edu.fpt.respository.TaskListRepository;
import vn.edu.fpt.service.PayOSService;
import vn.edu.fpt.service.TaskListService;
import vn.edu.fpt.util.enums.*;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayOSServiceImpl implements PayOSService {

    private static final long SUFFIX_FACTOR = 100_000L;      // 5 digits
    private static final long PAYMENT_FACTOR = 10_000L;      // 4 digits
    private static final long ORDER_CODE_FACTOR = PAYMENT_FACTOR * SUFFIX_FACTOR;

    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final TaskListRepository taskListRepository;
    private final InvoiceRepository invoiceRepository;
    private final PayOSProperties payOSProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final PayOS payOS;
    private final TaskListService taskListService;

    private final Set<Long> processedWebhookOrders = ConcurrentHashMap.newKeySet();

    @Override
    public PayOSCheckoutResponse createPaymentLink(CreatePayOSPaymentRequest request) {
        // validate request
        validatePayOSConfig();

        Payment payment = paymentRepository.findByIdAndStatus(request.getPaymentId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.PAYMENT_NOT_FOUND));

        Contract contract = contractRepository.findByIdAndStatus(payment.getContractId(), RecordStatus.active)
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

        long orderCode = buildOrderCode(contract.getId(), request.getPaymentId());
        String signatureData = "amount=" + payment.getAmount().longValue()
                + "&cancelUrl=" + cancelUrl
                + "&description=" + request.getDescription()
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;

        Map<String, Object> body = new HashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", payment.getAmount().longValue());
        body.put("description", request.getDescription());
        body.put("returnUrl", returnUrl);
        body.put("cancelUrl", cancelUrl);
        body.put("signature", hmacSha256(signatureData, payOSProperties.getChecksumKey()));

        String endpoint = payOSProperties.getBaseUrl() + payOSProperties.getCreatePaymentPath();
        log.info("Creating PayOS payos link at: {}", endpoint);
        log.info("Request body: {}", body);
        log.info("CHECKSUM KEY LENGTH: {}", payOSProperties.getChecksumKey().length());
        log.info("SIGNATURE RAW: {}", signatureData);

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
            log.error("Failed to create PayOS payos link", ex);
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

        int contractId = parseContractId(orderCode);
        Integer paymentId = parsePaymentId(orderCode);

        Payment payment = paymentRepository.findByIdAndStatus(paymentId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.PAYMENT_NOT_FOUND));
        if (payment.getPaymentState() == PaymentState.PENDING) {
            payment.setPaymentState(PaymentState.SUCCESS);
            payment.setMethod(PaymentMethod.BANK_TRANSFER);
            paymentRepository.save(payment);
        }
        Contract contract = contractRepository.findByIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        if (contract.getContractState() == ContractState.DRAFT) {
            contract.setContractState(ContractState.ACTIVE);
            if (!taskListRepository.existsByContractId(contract.getId())) {
                String title = (contract.getBrideName() != null ? contract.getBrideName() : "") +
                        " & " +
                        (contract.getGroomName() != null ? contract.getGroomName() : "");

                TaskListCreateRequest taskListRequest = TaskListCreateRequest.builder()
                        .contractId(contract.getId())
                        .name(title)
                        .description("Task list for contract " + contract.getContractNo())
                        .build();

                taskListService.createNewTaskList(taskListRequest);
            }
            contractRepository.save(contract);
        }
        Invoice invoice = invoiceRepository.findByContractIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));

        List<Payment> payments = paymentRepository.findAllByContractIdAndPaymentStateAndStatus(contractId, PaymentState.SUCCESS, RecordStatus.active);
        if(payments.size() > 1){
            invoice.setInvoiceState(InvoiceState.PAID);
        } else if (payments.size() == 1){
            invoice.setInvoiceState(InvoiceState.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);


        return WebhookAcknowledgeResponse.builder()
                .processed(true)
                .message("Webhook processed")
                .build();
    }


    private int parseContractId(long orderCode) {
        return (int) (orderCode / ORDER_CODE_FACTOR);
    }

    private int parsePaymentId(long orderCode) {
        long remain = orderCode % ORDER_CODE_FACTOR;
        return (int) (remain / SUFFIX_FACTOR);
    }

    private long buildOrderCode(int contractId, Integer paymentId) {
        long suffix = System.currentTimeMillis() % SUFFIX_FACTOR;

        return ((long) contractId) * ORDER_CODE_FACTOR
                + ((long) paymentId) * SUFFIX_FACTOR
                + suffix;
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

