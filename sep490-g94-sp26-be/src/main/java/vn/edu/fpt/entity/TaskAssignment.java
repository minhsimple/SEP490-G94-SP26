package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

@Entity
@Table(name = "task_assignments", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@IdClass(TaskAssignment.TaskAssignmentId.class)
public class TaskAssignment extends BaseEntity {

    @Id
    @Column(name = "task_id")
    Integer taskId;

    @Id
    @Column(name = "user_id")
    Integer userId;

    @ManyToOne
    @JoinColumn(name = "task_id", insertable = false, updatable = false)
    EventTask eventTask;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    User user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskAssignmentId implements Serializable {
        Integer taskId;
        Integer userId;
    }
}

