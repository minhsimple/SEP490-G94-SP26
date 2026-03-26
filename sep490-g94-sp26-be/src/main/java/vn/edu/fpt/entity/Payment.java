package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.util.enums.PaymentMethod;
import vn.edu.fpt.util.enums.PaymentState;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "contract_id", nullable = false)
    Integer contractId;

    @Column(nullable = false, precision = 14, scale = 2)
    BigDecimal amount;

    @Column(name = "paid_at", nullable = false)
    LocalDateTime paidAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    PaymentMethod method = PaymentMethod.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_state", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    PaymentState paymentState = PaymentState.PENDING;

    @Column(name = "reference_no")
    String referenceNo;

    String note;
}

