package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.fpt.dto.request.payment.CreatePayOSPaymentRequest;
import vn.edu.fpt.dto.request.payment.PayOSWebhookRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.payment.PayOSCheckoutResponse;
import vn.edu.fpt.dto.response.payment.WebhookAcknowledgeResponse;
import vn.edu.fpt.service.PayOSService;

@RestController
@RequestMapping("/api/payos")
@Tag(name = "Payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PayOSController {

    PayOSService payOSService;

    @Operation(summary = "Create PayOS payment link")
    @PostMapping("/payment/payos/create")
    public ApiResponse<PayOSCheckoutResponse> createPaymentLink(@RequestBody @Valid CreatePayOSPaymentRequest request) {
        return ApiResponse.<PayOSCheckoutResponse>builder()
                .data(payOSService.createPaymentLink(request))
                .build();
    }

    @Operation(summary = "PayOS webhook")
    @PostMapping("confirm-payment")
    public WebhookAcknowledgeResponse handleWebhook(@RequestBody Object body) {
        return payOSService.handleWebhook(body);
    }





//    @PostMapping("confirm-payment")
//    public ResponseEntity<?> webhook(@RequestBody(required = false) String body) {
//        System.out.println("Webhook hit: " + body);
//        return ResponseEntity.ok().build();
//    }

}

