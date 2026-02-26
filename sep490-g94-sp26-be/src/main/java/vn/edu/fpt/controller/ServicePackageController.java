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
import vn.edu.fpt.dto.request.servicepackage.ServicePackageFilterRequest;
import vn.edu.fpt.dto.request.servicepackage.ServicePackageRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.servicepackage.ServicePackageResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.ServicePackageService;

@RestController
@RequestMapping("/api/v1/service-package")
@Tag(name = "Service Package")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServicePackageController {
    ServicePackageService servicePackageService;

    @Operation(summary = "Tạo mới gói dịch vụ")
    @PostMapping("/create")
    public ApiResponse<ServicePackageResponse> createServicePackage(@RequestBody @Valid ServicePackageRequest request) {
        ServicePackageResponse response = servicePackageService.createServicePackage(request);
        return ApiResponse.<ServicePackageResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật gói dịch vụ")
    @PutMapping("/update")
    public ApiResponse<ServicePackageResponse> updateServicePackage(
            @RequestParam Integer servicePackageId,
            @RequestBody ServicePackageRequest request
    ) {
        ServicePackageResponse response = servicePackageService.updateServicePackage(servicePackageId, request);
        return ApiResponse.<ServicePackageResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết gói dịch vụ")
    @GetMapping("/{servicePackageId}")
    public ApiResponse<ServicePackageResponse> viewDetail(@PathVariable Integer servicePackageId) {
        ServicePackageResponse response = servicePackageService.getServicePackageDetail(servicePackageId);
        return ApiResponse.<ServicePackageResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái gói dịch vụ")
    @PutMapping("/{servicePackageId}/change-status")
    public ApiResponse<ServicePackageResponse> changeStatus(@PathVariable Integer servicePackageId) {
        ServicePackageResponse response = servicePackageService.changeStatus(servicePackageId);
        return ApiResponse.<ServicePackageResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Tìm kiếm / phân trang gói dịch vụ")
    @GetMapping("/search")
    public ApiResponse<SimplePage<ServicePackageResponse>> searchServicePackage(
            @Valid ServicePackageFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<ServicePackageResponse>>builder()
                .data(servicePackageService.searchServicePackage(pageable, filterRequest))
                .build();
    }
}
