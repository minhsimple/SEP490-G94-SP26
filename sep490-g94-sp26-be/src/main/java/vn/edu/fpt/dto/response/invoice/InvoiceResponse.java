package vn.edu.fpt.dto.response.invoice;

import lombok.*;
import vn.edu.fpt.util.enums.InvoiceState;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {
    private Integer id;
    private Integer contractId;
    private String contractNo;
    private Integer expectedTables;
    private InvoiceState invoiceState;
    private BigDecimal totalAmount;

    private HallResponse hall;
    private ServicesPackageResponse servicesPackage;
    private SetMenuResponse setMenu;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HallResponse {
        private String name;
        private BigDecimal basePrice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServicesPackageResponse {
        private String name;
        private BigDecimal basePrice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SetMenuResponse {
        private String name;
        private BigDecimal basePrice;
    }
}
