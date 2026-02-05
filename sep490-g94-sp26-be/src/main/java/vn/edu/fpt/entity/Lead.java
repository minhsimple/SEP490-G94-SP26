package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.LeadState;

@Entity
@Table(name = "leads", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "full_name", nullable = false)
    String fullName;

    String phone;

    String email;

    String source;

    String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_state", nullable = false)
    LeadState leadState = LeadState.NEW;

    @Column(name = "assigned_sales_id")
    Integer assignedSalesId;

    @ManyToOne
    @JoinColumn(name = "assigned_sales_id", insertable = false, updatable = false)
    User assignedSales;

    @Column(name = "created_from")
    String createdFrom;
}

