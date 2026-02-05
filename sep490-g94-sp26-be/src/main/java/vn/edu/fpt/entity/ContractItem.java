package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "contract_items", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "contract_id", nullable = false)
    Integer contractId;

    @ManyToOne
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    Contract contract;

    @Column(name = "item_type", nullable = false)
    String itemType;

    @Column(name = "ref_id")
    Integer refId;

    @Column(nullable = false)
    String description;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal qty = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 14, scale = 2)
    BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "sort_order", nullable = false)
    Integer sortOrder = 1;
}

