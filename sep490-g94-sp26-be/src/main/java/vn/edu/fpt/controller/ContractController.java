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
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.CalenderContractRequest;
import vn.edu.fpt.dto.request.contract.ContractFilterRequest;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.contract.ContractStatusRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.contract.CalenderContractResponse;
import vn.edu.fpt.dto.response.contract.ContractResponse;
import vn.edu.fpt.service.ContractService;
import vn.edu.fpt.util.enums.Constants;

import java.util.Date;
import java.util.List;


@RestController
@RequestMapping("/api/v1/contract")
@Tag(name = "Booking")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {

    ContractService contractService;

    @Operation(summary = "Tạo mới hợp đồng tiệc")
    @PostMapping("/create")
    public ApiResponse<ContractResponse> createContract(
            @RequestPart("request") @Valid ContractRequest request,
            @RequestPart("imageFiles") List<MultipartFile> imageFiles) throws Exception {
        ContractResponse response = contractService.createContract(request, imageFiles);
        return ApiResponse.<ContractResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật hợp đồng tiệc")
    @PutMapping("/update")
    public ApiResponse<ContractResponse> updateContract(
            @RequestParam Integer bookingId,
            @Valid @RequestPart("request") ContractRequest request,
            @RequestPart("imageFiles") List<MultipartFile> imageFiles) throws Exception {
        ContractResponse response = contractService.updateContract(bookingId, request, imageFiles);
        return ApiResponse.<ContractResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết hợp đồng")
    @GetMapping("/{id}")
    public ApiResponse<ContractResponse> viewDetailContract(@PathVariable Integer id) {
        ContractResponse response = contractService.getContractById(id);
        return ApiResponse.<ContractResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Tìm kiếm và phân trang hợp đồng")
    @GetMapping("/search")
    public ApiResponse<SimplePage<ContractResponse>> searchContracts(
            @Valid ContractFilterRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<ContractResponse>>builder()
                .data(contractService.searchContracts(pageable, filter))
                .build();
    }

    @Operation(summary = "Cập nhật trạng thái hợp đồng (DRAFT → CONVERTED/CANCELLED/EXPIRED)")
    @PutMapping("/update-state")
    public ApiResponse<ContractResponse> updateContractState(
            @Valid @RequestBody ContractStatusRequest request) {
        ContractResponse response = contractService.updateContractState(request);
        return ApiResponse.<ContractResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái hợp đồng")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<ContractResponse> changeContractStatus(@PathVariable Integer id) {
        ContractResponse response = contractService.changeContractStatus(id);
        return ApiResponse.<ContractResponse>builder()
                .data(response)
                .build();
    }
    @Operation(summary = "Lấy lịch đăt tiệc của hợp đồng")
    @GetMapping("/get-time-table")
    public ApiResponse<List<CalenderContractResponse>> getAllTimeTable(CalenderContractRequest request) {
        return ApiResponse.<List<CalenderContractResponse>>builder()
                .data(contractService.getAllTimeTable(request))
                .build();
    }

}


