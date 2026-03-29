package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.util.enums.InvoiceState;

import java.math.BigDecimal;

@Entity
@Table(name = "invoices", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Invoice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "contract_id", nullable = false)
    Integer contractId;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_state", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    InvoiceState invoiceState = InvoiceState.UNPAID;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    BigDecimal totalAmount = BigDecimal.ZERO;
}

