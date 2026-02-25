//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.EventState;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "events", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Event extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "booking_id", unique = true, nullable = false)
//    UUID bookingId;
//
//    @Column(name = "coordinator_id")
//    UUID coordinatorId;
//
//    @Column(name = "assigned_by", nullable = false)
//    UUID assignedBy;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "event_state", nullable = false)
//    EventState eventState = EventState.PLANNED;
//
//    @Column(name = "actual_start")
//    LocalDateTime actualStart;
//
//    @Column(name = "actual_end")
//    LocalDateTime actualEnd;
//}
//
