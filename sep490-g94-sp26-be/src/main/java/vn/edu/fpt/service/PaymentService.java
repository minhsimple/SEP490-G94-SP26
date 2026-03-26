package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.response.payment.PaymentResponse;
import vn.edu.fpt.util.enums.PaymentState;

import java.util.UUID;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse updatePayment(Integer id, PaymentRequest request);

    PaymentResponse getPaymentById(Integer id);

    SimplePage<PaymentResponse> getAllPayments(Pageable pageable);

    SimplePage<PaymentResponse> getPaymentsByContract(Integer contractId, Pageable pageable);

    SimplePage<PaymentResponse> filterPayments(Integer contractId, PaymentState paymentState, Pageable pageable);

    PaymentResponse changePaymentStatus(Integer id, PaymentState status);

    void deletePayment(Integer id);
}

