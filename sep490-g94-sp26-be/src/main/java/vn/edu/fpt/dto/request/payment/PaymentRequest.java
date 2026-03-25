package vn.edu.fpt.dto.request.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import vn.edu.fpt.util.enums.PaymentMethod;
import vn.edu.fpt.util.enums.PaymentState;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Contract ID không được để trống")
    Integer contractId;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    BigDecimal amount;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    PaymentMethod method;

    PaymentState paymentState;

    String referenceNo;

    String note;
}
