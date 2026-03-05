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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.customer.CustomersFilterRequest;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.request.service.ServiceFilterRequest;
import vn.edu.fpt.dto.request.service.ServiceRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;
import vn.edu.fpt.dto.response.service.ServiceResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.ServiceItemService;

@RestController
@RequestMapping("/api/v1/service")
@Tag(name = "Service")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceController {
    ServiceItemService serviceItemService;

    @Operation(summary = "Tạo mới dịch vụ")
    @PostMapping("/create")
    public ApiResponse<ServiceResponse> createServiceItem(@RequestBody @Valid ServiceRequest request) {
        ServiceResponse response = serviceItemService.createService(request);
        return ApiResponse.<ServiceResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật dịch vụ")
    @PutMapping("/update")
    public ApiResponse<ServiceResponse> updateService(
            @RequestParam Integer serviceId,
            @Valid @RequestBody ServiceRequest serviceRequest
    ) {
        ServiceResponse serviceResponse = serviceItemService.updateService(serviceId, serviceRequest);
        return ApiResponse.<ServiceResponse>builder()
                .data(serviceResponse)
                .build();
    }

    @Operation(summary = "xem chi tiết dịch vụ")
    @GetMapping("/{serviceId}")
    public ApiResponse<ServiceResponse> viewDetailService(@PathVariable Integer serviceId) {
        ServiceResponse serviceResponse = serviceItemService.getServiceDetail(serviceId);
        return ApiResponse.<ServiceResponse>builder()
                .data(serviceResponse)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái dich vụ")
    @PutMapping("/{menuItemId}/change-status")
    public ApiResponse<ServiceResponse> changeStatusService(@PathVariable Integer menuItemId) {
        ServiceResponse serviceResponse = serviceItemService.changeStatus(menuItemId);
        return ApiResponse.<ServiceResponse>builder()
                .data(serviceResponse)
                .build();
    }

    @Operation(summary = "Xem danh sách dịch vụ")
    @GetMapping("/search")
    public ApiResponse<SimplePage<ServiceResponse>> searchService(
            @Valid ServiceFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<ServiceResponse>>builder()
                .data(serviceItemService.searchService( pageable, filterRequest))
                .build();
    }

}
