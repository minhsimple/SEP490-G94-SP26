package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "beos", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Beo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "event_id", unique = true, nullable = false)
    Integer eventId;

    @OneToOne
    @JoinColumn(name = "event_id", insertable = false, updatable = false)
    Event event;

    @Column(name = "expected_guests")
    Integer expectedGuests;

    @Column(name = "expected_tables")
    Integer expectedTables;

    @Column(name = "set_menu_id", nullable = false)
    Integer setMenuId;

    @ManyToOne
    @JoinColumn(name = "set_menu_id", insertable = false, updatable = false)
    SetMenu setMenu;

    @Column(name = "quantity_sets", nullable = false)
    Integer quantitySets;

    @Column(name = "special_requests")
    String specialRequests;
}

