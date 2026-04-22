package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.invoice.InvoiceFilterRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.invoice.InvoiceResponse;
import vn.edu.fpt.entity.Invoice;
import vn.edu.fpt.service.InvoiceService;
import vn.edu.fpt.util.enums.Constants;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoice")
@Tag(name = "Invoice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceController {
    InvoiceService invoiceService;

    @Operation(summary = "Xem chi tiết thông tin hóa đơn")
    @GetMapping("/{id}")
    public ApiResponse<InvoiceResponse> viewDetailInvoice(@PathVariable Integer id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ApiResponse.<InvoiceResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem danh sách hóa đơn")
    @GetMapping("/search")
    public ApiResponse<SimplePage<InvoiceResponse>> getAllInvoices(
            @Valid InvoiceFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<InvoiceResponse>>builder()
                .data(invoiceService.getAllInvoices(pageable, filterRequest))
                .build();
    }

    @Operation(summary = "Thanh lí hóa đơn")
    @PostMapping("/liquidate/{id}")
    public ApiResponse<InvoiceResponse> liquidateInvoice(@PathVariable Integer id) {
        return ApiResponse.<InvoiceResponse>builder()
                .data(invoiceService.liquidateInvoice(id))
                .build();
    }

    @Operation(summary = "Xem danh sách phát sinh trong hóa đơn")
    @GetMapping("/incidents/{contractId}")
    public ApiResponse<List<Invoice.IncidentInvoice>> getAllIncidents(@PathVariable Integer contractId) {
        return ApiResponse.<List<Invoice.IncidentInvoice>>builder()
                .data(invoiceService.getIncidentInvoices(contractId))
                .build();
    }

    @Operation(summary = "Chỉnh sửa danh sách phát sinh cho hóa đơn")
    @PutMapping("/incidents/{contractId}")
    public ApiResponse<List<Invoice.IncidentInvoice>> updateIncidents(
            @PathVariable Integer contractId,
            @RequestBody List<Invoice.IncidentInvoice> incidentInvoices) {
        return ApiResponse.<List<Invoice.IncidentInvoice>>builder()
                .data(invoiceService.updateIncidentInvoices(contractId, incidentInvoices))
                .build();
    }
}
