package vn.edu.fpt.entity;

import vn.edu.fpt.enums.IncidentState;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "incidents", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Incident extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(nullable = false, length = 100)
    String name;

    String description;

    @Column(name = "beo_id")
    Integer beoId;

    @ManyToOne
    @JoinColumn(name = "beo_id", insertable = false, updatable = false)
    Beo beo;

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_state", nullable = false)
    IncidentState incidentState = IncidentState.UNRESOLVED;
}

