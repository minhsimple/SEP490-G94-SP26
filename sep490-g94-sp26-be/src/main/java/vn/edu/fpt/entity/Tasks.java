package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.util.enums.TaskState;

@Entity
@Table(name = "tasks", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Tasks extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "task_list_id", nullable = false)
    Integer taskListId;

    @Column(nullable = false)
    String title;

    String description;

    TaskState state;

    Integer priority;

    Integer taskCategoryId;


}

