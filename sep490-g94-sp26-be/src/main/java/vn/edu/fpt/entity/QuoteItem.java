package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "quote_items", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuoteItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "quote_id", nullable = false)
    Integer quoteId;

    @ManyToOne
    @JoinColumn(name = "quote_id", insertable = false, updatable = false)
    Quotation quotation;

    @Column(name = "item_type", nullable = false)
    String itemType;

    @Column(name = "ref_id")
    Integer refId;

    @Column(nullable = false)
    String description;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal qty = BigDecimal.ONE;

    @Column(name = "sort_order", nullable = false)
    Integer sortOrder = 1;
}

