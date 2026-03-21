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
import vn.edu.fpt.dto.request.booking.BookingFilterRequest;
import vn.edu.fpt.dto.request.booking.BookingRequest;
import vn.edu.fpt.dto.request.booking.ContractStatusRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.booking.BookingResponse;
import vn.edu.fpt.service.BookingService;
import vn.edu.fpt.service.ContractService;
import vn.edu.fpt.util.enums.Constants;


@RestController
@RequestMapping("/api/v1/booking")
@Tag(name = "Booking")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {

    ContractService contractService;

    @Operation(summary = "Tạo mới đặt tiệc")
    @PostMapping("/create")
    public ApiResponse<BookingResponse> createContract(@RequestBody @Valid BookingRequest request) {
        BookingResponse response = contractService.createContract(request);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật đặt tiệc")
    @PutMapping("/update")
    public ApiResponse<BookingResponse> updateContract(
            @RequestParam Integer bookingId,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = contractService.updateContract(bookingId, request);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết đặt tiệc")
    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> viewDetailContract(@PathVariable Integer id) {
        BookingResponse response = contractService.getContractById(id);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Tìm kiếm và phân trang đặt tiệc")
    @GetMapping("/search")
    public ApiResponse<SimplePage<BookingResponse>> searchContracts(
            @Valid BookingFilterRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<BookingResponse>>builder()
                .data(contractService.searchContracts(pageable, filter))
                .build();
    }

    @Operation(summary = "Cập nhật trạng thái hợp đồng (DRAFT → CONVERTED/CANCELLED/EXPIRED)")
    @PutMapping("/update-state")
    public ApiResponse<BookingResponse> updateContractState(
            @Valid @RequestBody ContractStatusRequest request) {
        BookingResponse response = contractService.updateContractState(request);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái hợp đồng")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<BookingResponse> changeContractStatus(@PathVariable Integer id) {
        BookingResponse response = contractService.changeContractStatus(id);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }
}


