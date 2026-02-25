//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//
//import java.io.Serializable;
//import java.util.UUID;
//
//@Entity
//@Table(name = "task_assignments", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//@IdClass(TaskAssignment.TaskAssignmentId.class)
//public class TaskAssignment extends BaseEntity {
//
//    @Id
//    @Column(name = "task_id")
//    UUID taskId;
//
//    @Id
//    @Column(name = "user_id")
//    UUID userId;
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class TaskAssignmentId implements Serializable {
//        UUID taskId;
//        UUID userId;
//    }
//}
//
