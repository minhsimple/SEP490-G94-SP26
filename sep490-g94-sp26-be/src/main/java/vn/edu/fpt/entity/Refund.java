package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Refund extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "contract_id", nullable = false)
    Integer contractId;

    @ManyToOne
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    Contract contract;

    @Column(nullable = false, precision = 14, scale = 2)
    BigDecimal amount;

    @Column(name = "refund_at", nullable = false)
    LocalDateTime refundAt = LocalDateTime.now();

    String reason;

    @Column(name = "approved_by")
    Integer approvedBy;

    @ManyToOne
    @JoinColumn(name = "approved_by", insertable = false, updatable = false)
    User approver;
}

