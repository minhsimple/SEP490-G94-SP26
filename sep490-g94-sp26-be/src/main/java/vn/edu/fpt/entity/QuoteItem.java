//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//
//import java.math.BigDecimal;
//import java.util.UUID;
//
//@Entity
//@Table(name = "quote_items", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class QuoteItem extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "quote_id", nullable = false)
//    UUID quoteId;
//
//
//    @Column(name = "item_type", nullable = false)
//    String itemType;
//
//    @Column(name = "ref_id")
//    UUID refId;
//
//    @Column(nullable = false)
//    String description;
//
//    @Column(nullable = false, precision = 12, scale = 2)
//    BigDecimal qty = BigDecimal.ONE;
//
//    @Column(name = "sort_order", nullable = false)
//    Integer sortOrder = 1;
//}
//
