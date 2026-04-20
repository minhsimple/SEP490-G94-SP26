package vn.edu.fpt.dto.response.invoice;

import lombok.*;
import vn.edu.fpt.entity.Invoice;
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
    private Invoice.InvoiceData data;
}
