package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "beo_timeline_items", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BeoTimelineItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "beo_id", nullable = false)
    Integer beoId;

    @ManyToOne
    @JoinColumn(name = "beo_id", insertable = false, updatable = false)
    Beo beo;

    @Column(name = "at_time", nullable = false)
    LocalDateTime atTime;

    @Column(nullable = false)
    String title;

    String description;

    @Column(name = "owner_team")
    String ownerTeam;

    @Column(name = "sort_order", nullable = false)
    Integer sortOrder = 1;
}

