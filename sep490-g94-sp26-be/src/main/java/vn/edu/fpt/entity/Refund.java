//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "refunds", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Refund extends BaseEntity {
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
//    @Column(name = "refund_at", nullable = false)
//    LocalDateTime refundAt = LocalDateTime.now();
//
//    String reason;
//
//    @Column(name = "approved_by")
//    UUID approvedBy;
//}
//
