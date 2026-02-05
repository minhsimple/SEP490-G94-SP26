package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.EventState;

import java.time.LocalDateTime;

@Entity
@Table(name = "events", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Event extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "booking_id", unique = true, nullable = false)
    Integer bookingId;

    @OneToOne
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    Booking booking;

    @Column(name = "coordinator_id")
    Integer coordinatorId;

    @ManyToOne
    @JoinColumn(name = "coordinator_id", insertable = false, updatable = false)
    User coordinator;

    @Column(name = "assigned_by", nullable = false)
    Integer assignedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_by", insertable = false, updatable = false)
    User assigner;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_state", nullable = false)
    EventState eventState = EventState.PLANNED;

    @Column(name = "actual_start")
    LocalDateTime actualStart;

    @Column(name = "actual_end")
    LocalDateTime actualEnd;
}

