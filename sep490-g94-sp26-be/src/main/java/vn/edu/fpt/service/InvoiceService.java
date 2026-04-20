package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.invoice.InvoiceFilterRequest;
import vn.edu.fpt.dto.response.invoice.InvoiceResponse;
import vn.edu.fpt.entity.Invoice;

public interface InvoiceService {
    Invoice.InvoiceData generateInvoice(Integer contractId);

    InvoiceResponse createInvoice(Integer contractId);
    InvoiceResponse getInvoiceById(Integer id);
    SimplePage<InvoiceResponse> getAllInvoices(Pageable pageable, InvoiceFilterRequest filterRequest);
}
