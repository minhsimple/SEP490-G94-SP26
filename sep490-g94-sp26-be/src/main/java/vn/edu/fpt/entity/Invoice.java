//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.InvoiceState;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "invoices", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Invoice extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "contract_id", nullable = false)
//    UUID contractId;
//
//    @Column(name = "invoice_no", unique = true, nullable = false)
//    String invoiceNo;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "invoice_state", nullable = false)
//    InvoiceState invoiceState = InvoiceState.DRAFT;
//
//    @Column(name = "issued_at")
//    LocalDateTime issuedAt;
//
//    @Column(name = "buyer_name")
//    String buyerName;
//
//    @Column(name = "buyer_tax_code")
//    String buyerTaxCode;
//
//    @Column(name = "buyer_address")
//    String buyerAddress;
//
//    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
//    BigDecimal totalAmount = BigDecimal.ZERO;
//
//    @Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
//    BigDecimal vatRate = BigDecimal.ZERO;
//
//    @Column(name = "pdf_url")
//    String pdfUrl;
//}
//
