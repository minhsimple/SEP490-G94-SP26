package vn.edu.fpt.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.util.enums.InvoiceState;

import java.math.BigDecimal;
import java.util.List;

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

    @Column(name = "contract_id", nullable = false, unique = true)
    Integer contractId;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_state", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    InvoiceState invoiceState = InvoiceState.UNPAID;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    BigDecimal totalAmount = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    InvoiceData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceData {
        @JsonProperty("hall_invoice")
        private HallInvoice hallInvoice;

        @JsonProperty("set_menu_invoice")
        private SetMenuInvoice setMenuInvoice;

        @JsonProperty("service_package_invoice")
        private ServicePackageInvoice servicePackageInvoice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HallInvoice {
        private Integer id;
        private String code;
        private String name;
        private BigDecimal price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetMenuInvoice {
        private Integer id;
        private String code;
        private String name;
        private BigDecimal price;

        @JsonProperty("menu_items")
        private List<MenuItemInvoice> menuItems;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemInvoice {
        private Integer id;
        private String code;
        private String name;
        private BigDecimal price;
        private String unit;
        private Integer quantity;

        @JsonProperty("category_name")
        private String categoryName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicePackageInvoice {
        private Integer id;
        private String code;
        private String name;
        private BigDecimal price;

        List<ServiceInvoice> services;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceInvoice {
        private Integer id;
        private String code;
        private String name;
        private BigDecimal price;
        private String unit;
    }
}

