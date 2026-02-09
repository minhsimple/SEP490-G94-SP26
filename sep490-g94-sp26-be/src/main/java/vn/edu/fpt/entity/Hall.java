//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//
//import java.util.UUID;
//
//@Entity
//@Table(name = "halls", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Hall extends BaseEntity {
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
//    String location;
//
//    @Column(nullable = false)
//    Integer capacity;
//
//    String notes;
//}
//
