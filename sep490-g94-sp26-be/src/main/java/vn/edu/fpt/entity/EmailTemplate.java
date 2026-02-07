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
//@Table(name = "email_templates", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class EmailTemplate extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(unique = true, nullable = false)
//    String code;
//
//    @Column(nullable = false)
//    String subject;
//
//    @Column(nullable = false)
//    String body;
//}
//
