package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.TaskState;

import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_timeline_items", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KitchenTimelineItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "event_id", nullable = false)
    Integer eventId;

    @ManyToOne
    @JoinColumn(name = "event_id", insertable = false, updatable = false)
    Event event;

    @Column(name = "at_time", nullable = false)
    LocalDateTime atTime;

    @Column(nullable = false)
    String title;

    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_state", nullable = false)
    TaskState taskState = TaskState.TODO;
}

