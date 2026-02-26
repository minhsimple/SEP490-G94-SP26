//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.TaskState;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "kitchen_timeline_items", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class KitchenTimelineItem extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "event_id", nullable = false)
//    UUID eventId;
//
//
//    @Column(name = "at_time", nullable = false)
//    LocalDateTime atTime;
//
//    @Column(nullable = false)
//    String title;
//
//    String description;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "task_state", nullable = false)
//    TaskState taskState = TaskState.TODO;
//}
//
