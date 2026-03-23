package vn.edu.fpt.service;

import vn.edu.fpt.dto.request.payment.CreatePayOSPaymentRequest;
import vn.edu.fpt.dto.request.payment.PayOSWebhookRequest;
import vn.edu.fpt.dto.response.payment.PayOSCheckoutResponse;
import vn.edu.fpt.dto.response.payment.WebhookAcknowledgeResponse;

public interface PayOSService {

    PayOSCheckoutResponse createPaymentLink(CreatePayOSPaymentRequest request);

    WebhookAcknowledgeResponse handleWebhook(Object request);
}

