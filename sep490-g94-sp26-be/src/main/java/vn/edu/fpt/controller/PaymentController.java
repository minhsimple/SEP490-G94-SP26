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
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.response.payment.PaymentResponse;
import vn.edu.fpt.service.PaymentService;
import vn.edu.fpt.util.enums.Constants;
import vn.edu.fpt.util.enums.PaymentState;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentService paymentService;

    @Operation(summary = "Tạo thanh toán mới")
    @PostMapping("/create")
    public ApiResponse<PaymentResponse> createPayment(@RequestBody @Valid PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        return ApiResponse.<PaymentResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật thanh toán")
    @PutMapping("/{id}")
    public ApiResponse<PaymentResponse> updatePayment(
            @PathVariable Integer id,
            @RequestBody @Valid PaymentRequest request) {
        PaymentResponse response = paymentService.updatePayment(id, request);
        return ApiResponse.<PaymentResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết thanh toán")
    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPaymentById(@PathVariable Integer id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ApiResponse.<PaymentResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem danh sách tất cả thanh toán")
    @GetMapping
    public ApiResponse<SimplePage<PaymentResponse>> getAllPayments(
            @ParameterObject @PageableDefault(
                    size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        SimplePage<PaymentResponse> response = paymentService.getAllPayments(pageable);
        return ApiResponse.<SimplePage<PaymentResponse>>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem danh sách thanh toán theo hợp đồng")
    @GetMapping("/contract/{contractId}")
    public ApiResponse<SimplePage<PaymentResponse>> getPaymentsByContract(
            @PathVariable Integer contractId,
            @ParameterObject @PageableDefault(
                    size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        SimplePage<PaymentResponse> response = paymentService.getPaymentsByContract(contractId, pageable);
        return ApiResponse.<SimplePage<PaymentResponse>>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Lọc thanh toán theo hợp đồng và trạng thái")
    @GetMapping("/filter")
    public ApiResponse<SimplePage<PaymentResponse>> filterPayments(
            @RequestParam(required = false) Integer contractId,
            @RequestParam(required = false) PaymentState paymentState,
            @ParameterObject @PageableDefault(
                    size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        SimplePage<PaymentResponse> response = paymentService.filterPayments(contractId, paymentState, pageable);
        return ApiResponse.<SimplePage<PaymentResponse>>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái thanh toán")
    @PatchMapping("/{id}/status")
    public ApiResponse<PaymentResponse> changePaymentStatus(
            @PathVariable Integer id,
            @RequestParam PaymentState status) {
        PaymentResponse response = paymentService.changePaymentStatus(id, status);
        return ApiResponse.<PaymentResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xóa thanh toán (soft delete)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePayment(@PathVariable Integer id) {
        paymentService.deletePayment(id);
        return ApiResponse.<Void>builder()
                .build();
    }
}
