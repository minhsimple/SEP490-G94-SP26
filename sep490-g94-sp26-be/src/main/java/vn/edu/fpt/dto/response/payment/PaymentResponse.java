package vn.edu.fpt.dto.response.payment;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.PaymentState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {

    Integer id;

    Integer contractId;

    BigDecimal amount;

    LocalDateTime paidAt;

    String method;

    PaymentState paymentState;

    String referenceNo;

    String note;

    RecordStatus status;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;

    Integer PaymentPercent;
}
