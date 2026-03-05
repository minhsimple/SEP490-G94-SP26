//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.ComplaintState;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "complaints", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Complaint extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "customer_id")
//    UUID customerId;
//
//    @Column(name = "event_id")
//    UUID eventId;
//
//    @Column(nullable = false)
//    String content;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "complaint_state", nullable = false)
//    ComplaintState complaintState = ComplaintState.PENDING;
//
//    @Column(name = "assigned_to")
//    UUID assignedTo;
//
//
//    @Column(name = "closed_at")
//    LocalDateTime closedAt;
//}
//
