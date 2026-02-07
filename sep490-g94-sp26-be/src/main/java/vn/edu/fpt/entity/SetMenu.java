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
//@Table(name = "set_menus", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class SetMenu extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(unique = true, nullable = false)
//    String code;
//
//    @Column(nullable = false)
//    String name;
//
//    String description;
//
//    @Column(name = "set_price", nullable = false, precision = 12, scale = 2)
//    BigDecimal setPrice = BigDecimal.ZERO;
//}
//
