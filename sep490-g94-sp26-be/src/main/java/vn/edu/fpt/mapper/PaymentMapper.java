package vn.edu.fpt.mapper;

import org.mapstruct.*;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.response.payment.PaymentResponse;
import vn.edu.fpt.entity.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paymentState", defaultValue = "PENDING")
    @Mapping(target = "paidAt", expression = "java(java.time.LocalDateTime.now())")
    Payment toEntity(PaymentRequest request);

    PaymentResponse toResponse(Payment payment);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget Payment payment, PaymentRequest request);
}

