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
//@Table(name = "quotations", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Quotation extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "quote_no", unique = true, nullable = false)
//    String quoteNo;
//
//    @Column(name = "lead_id")
//    UUID leadId;
//
//    @Column(name = "customer_id")
//    UUID customerId;
//
//
//    @Column(nullable = false, precision = 14, scale = 2)
//    BigDecimal subtotal = BigDecimal.ZERO;
//
//    @Column(name = "discount_amount", nullable = false, precision = 14, scale = 2)
//    BigDecimal discountAmount = BigDecimal.ZERO;
//
//    @Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
//    BigDecimal vatRate = BigDecimal.ZERO;
//
//    @Column(name = "vat_amount", nullable = false, precision = 14, scale = 2)
//    BigDecimal vatAmount = BigDecimal.ZERO;
//
//    @Column(nullable = false, precision = 14, scale = 2)
//    BigDecimal total = BigDecimal.ZERO;
//
//    @Column(name = "sent_at")
//    LocalDateTime sentAt;
//
//    @Column(name = "accepted_at")
//    LocalDateTime acceptedAt;
//}
//
