package vn.edu.fpt.dto.request.payos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePayOSPaymentRequest {

    @NotNull(message = "Contract id must not be null")
    Integer contractId;

    @NotBlank(message = "Payment description must not be blank")
    String description = "Thanh toán hợp đồng tiệc cưới";

    String returnUrl;

    String cancelUrl;

    @NotNull
    Integer paymentId;
}
