package vn.edu.fpt.dto.request.invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.InvoiceState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceFilterRequest {
    Integer contractId;
    InvoiceState invoiceState;
    BigDecimal lowerBoundTotalAmount;
    BigDecimal upperBoundTotalAmount;
    RecordStatus status;
}
