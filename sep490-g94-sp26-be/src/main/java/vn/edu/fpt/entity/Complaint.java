package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.ComplaintState;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Complaint extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "customer_id")
    Integer customerId;

    @ManyToOne
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    Customer customer;

    @Column(name = "event_id")
    Integer eventId;

    @ManyToOne
    @JoinColumn(name = "event_id", insertable = false, updatable = false)
    Event event;

    @Column(nullable = false)
    String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_state", nullable = false)
    ComplaintState complaintState = ComplaintState.PENDING;

    @Column(name = "assigned_to")
    Integer assignedTo;

    @ManyToOne
    @JoinColumn(name = "assigned_to", insertable = false, updatable = false)
    User assignedUser;

    @Column(name = "closed_at")
    LocalDateTime closedAt;
}

