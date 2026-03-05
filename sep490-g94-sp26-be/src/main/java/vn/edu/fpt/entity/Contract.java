//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.ContractState;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "contracts", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Contract extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "contract_no", unique = true, nullable = false)
//    String contractNo;
//
//    @Column(name = "booking_id", unique = true, nullable = false)
//    UUID bookingId;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "contract_state", nullable = false)
//    ContractState contractState = ContractState.DRAFT;
//
//    @Column(name = "signed_at")
//    LocalDateTime signedAt;
//
//    String notes;
//}
//
