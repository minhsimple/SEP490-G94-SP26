package vn.edu.fpt.dto.request.payment;

import lombok.Data;

@Data
public class PayOSWebhookRequest {
    private String code;
    private String desc;
    private Boolean success;
    private PayOSWebhookData data;
    private String signature;

    @Data
    public static class PayOSWebhookData {
        private Long orderCode;
        private Long amount;
        private String description;
        private String status;
        private String paymentLinkId;
        private String reference;
        private String transactionDateTime;
        private String signature;
    }
}

