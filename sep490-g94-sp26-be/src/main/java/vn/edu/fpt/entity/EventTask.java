package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.TaskState;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_tasks", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventTask extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "timeline_items_id", nullable = false)
    Integer timelineItemsId;

    @ManyToOne
    @JoinColumn(name = "timeline_items_id", insertable = false, updatable = false)
    BeoTimelineItem beoTimelineItem;

    @Column(nullable = false)
    String title;

    String description;

    @Column(name = "due_at")
    LocalDateTime dueAt;

    @Column(name = "is_kitchen_task", nullable = false)
    Boolean isKitchenTask;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_state", nullable = false)
    TaskState taskState = TaskState.TODO;
}

