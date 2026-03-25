package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.response.payment.PaymentResponse;
import vn.edu.fpt.util.enums.PaymentState;

import java.util.UUID;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse updatePayment(UUID id, PaymentRequest request);

    PaymentResponse getPaymentById(UUID id);

    SimplePage<PaymentResponse> getAllPayments(Pageable pageable);

    SimplePage<PaymentResponse> getPaymentsByContract(UUID contractId, Pageable pageable);

    SimplePage<PaymentResponse> filterPayments(UUID contractId, PaymentState paymentState, Pageable pageable);

    PaymentResponse changePaymentStatus(UUID id, PaymentState status);

    void deletePayment(UUID id);
}

