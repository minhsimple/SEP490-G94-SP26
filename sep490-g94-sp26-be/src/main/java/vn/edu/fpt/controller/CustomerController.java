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
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.request.customer.CustomerUpdateRequest;
import vn.edu.fpt.dto.request.customer.CustomersFilterRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.entity.Customer;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.CustomerService;

@RestController
@RequestMapping("/api/v1/customer")
@Tag(name = "Customer")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerController {

    CustomerService customerService;

    @Operation(summary = "Tạo khách hàng mới")
    @PostMapping("/create")
    public ApiResponse<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest customerRequest) {
        CustomerResponse customerResponse = customerService.createCustomer(customerRequest);
        return ApiResponse.<CustomerResponse>builder()
                .data(customerResponse)
                .build();
    }

    @Operation(summary = "Cập nhật khách hàng")
    @PutMapping("/update")
    public ApiResponse<CustomerResponse> updateCustomer(@RequestParam Integer customerId,
                                                        @Valid @RequestBody CustomerUpdateRequest updateRequest) {
        CustomerResponse customerResponse = customerService.updateCustomer(customerId, updateRequest);
        return ApiResponse.<CustomerResponse>builder()
                .data(customerResponse)
                .build();
    }

    @Operation(summary = "Xem chi tiết thông tin của khách hàng")
    @GetMapping("/{customerId}")
    public ApiResponse<CustomerResponse> viewDetailCustomer(@PathVariable Integer customerId) {
        CustomerResponse customerResponse = customerService.getCustomerById(customerId);
        return ApiResponse.<CustomerResponse>builder()
                .data(customerResponse)
                .build();
    }

    @Operation(summary = "Xem danh sách khách hàng")
    @GetMapping("/search")
    public ApiResponse<SimplePage<CustomerResponse>> getAllCustomers(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CustomersFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<CustomerResponse>>builder()
                .data(customerService.getAllCustomers(userDetails, pageable, filterRequest))
                .build();
    }

    @Operation(summary = "Thay đổi status (bật tắt) khách hàng")
    @PutMapping("/{id}/change-status")
    public ApiResponse<CustomerResponse> changeStatusCustomer(@PathVariable Integer id) {
        CustomerResponse customerResponse = customerService.changeStatusCustomer(id);
        return ApiResponse.<CustomerResponse>builder()
                .data(customerResponse)
                .build();
    }
}
