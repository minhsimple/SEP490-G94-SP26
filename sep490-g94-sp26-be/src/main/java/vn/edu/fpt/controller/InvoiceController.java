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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.invoice.InvoiceFilterRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.invoice.InvoiceResponse;
import vn.edu.fpt.service.InvoiceService;
import vn.edu.fpt.util.enums.Constants;

@RestController
@RequestMapping("/api/v1/invoice")
@Tag(name = "Invoice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceController {
    InvoiceService invoiceService;

//    @GetMapping("/data/{contractId}")
//    public ApiResponse<Invoice.InvoiceData> viewInvoiceData(@PathVariable Integer contractId) {
//        Invoice.InvoiceData data = invoiceService.generateInvoice(contractId);
//        return ApiResponse.<Invoice.InvoiceData>builder()
//                .data(data)
//                .build();
//    }

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
}
