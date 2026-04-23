package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.invoice.InvoiceFilterRequest;
import vn.edu.fpt.dto.response.invoice.InvoiceResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.entity.Invoice;

import java.util.List;

public interface InvoiceService {
    InvoiceResponse createInvoice(Integer contractId);
    InvoiceResponse getInvoiceById(Integer id);
    Invoice.InvoiceData updateInvoiceWhenUpdatingContract(Contract contract, ContractRequest contractRequest);
    List<Invoice.IncidentInvoice> getIncidentInvoices(Integer contractId);
    List<Invoice.IncidentInvoice> updateIncidentInvoices(Integer contractId, List<Invoice.IncidentInvoice> incidents);
    SimplePage<InvoiceResponse> getAllInvoices(Pageable pageable, InvoiceFilterRequest filterRequest);
    InvoiceResponse liquidateInvoice(Integer id);
    InvoiceResponse refundInvoice(Integer id);
}
