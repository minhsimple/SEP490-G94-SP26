package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "lead_conversions", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LeadConversion extends BaseEntity {

    @Id
    @Column(name = "lead_id")
    Integer leadId;

    @OneToOne
    @JoinColumn(name = "lead_id", insertable = false, updatable = false)
    Lead lead;

    @Column(name = "customer_id", nullable = false)
    Integer customerId;

    @ManyToOne
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    Customer customer;

    @Column(name = "converted_at", nullable = false)
    LocalDateTime convertedAt = LocalDateTime.now();
}

