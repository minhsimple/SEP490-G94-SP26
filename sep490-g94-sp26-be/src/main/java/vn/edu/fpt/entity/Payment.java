//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.PaymentState;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "payments", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Payment extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "contract_id", nullable = false)
//    UUID contractId;
//
//    @Column(nullable = false, precision = 14, scale = 2)
//    BigDecimal amount;
//
//    @Column(name = "paid_at", nullable = false)
//    LocalDateTime paidAt = LocalDateTime.now();
//
//    @Column(nullable = false)
//    String method;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_state", nullable = false)
//    PaymentState paymentState = PaymentState.PAID;
//
//    @Column(name = "reference_no")
//    String referenceNo;
//
//    String note;
//}
//
