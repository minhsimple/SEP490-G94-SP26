//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.LeadState;
//
//import java.util.UUID;
//
//@Entity
//@Table(name = "leads", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Lead extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "full_name", nullable = false)
//    String fullName;
//
//    String phone;
//
//    String email;
//
//    String source;
//
//    String notes;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "lead_state", nullable = false)
//    LeadState leadState = LeadState.NEW;
//
//    @Column(name = "assigned_sales_id")
//    UUID assignedSalesId;
//
//    @Column(name = "created_from")
//    String createdFrom;
//}
//
