package vn.edu.fpt.service;

import vn.edu.fpt.dto.request.payos.CreatePayOSPaymentRequest;
import vn.edu.fpt.dto.response.payos.PayOSCheckoutResponse;
import vn.edu.fpt.dto.response.payos.WebhookAcknowledgeResponse;

public interface PayOSService {

    PayOSCheckoutResponse createPaymentLink(CreatePayOSPaymentRequest request);

    WebhookAcknowledgeResponse handleWebhook(Object request);
}

