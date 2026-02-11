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
import vn.edu.fpt.dto.request.lead.LeadRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.lead.LeadResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.LeadService;

@RestController
@RequestMapping("/api/v1/lead")
@Tag(name = "Lead")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LeadController {

    LeadService leadService;

    @Operation(summary = "Tạo khách hàng tiềm năng mới")
    @PostMapping("/create")
    public ApiResponse<LeadResponse> createLead(@RequestBody @Valid LeadRequest request) {
        LeadResponse response = leadService.createLead(request);
        return ApiResponse.<LeadResponse>builder()
                .data(response)
                .build();
    }
    @Operation(summary = "Cập nhật khách hàng tiềm năng mới")
    @PostMapping("/update")
    public ApiResponse<LeadResponse> updateLead(@RequestBody @Valid LeadRequest request,
                                                @RequestParam Integer leadId) {
        LeadResponse response = leadService.updateLead(leadId,request);
        return ApiResponse.<LeadResponse>builder()
                .data(response)
                .build();
    }
    @Operation(summary = "Xem chi tiết thông tin khách hàng tiềm năng ")
    @PostMapping("/{id}")
    public ApiResponse<LeadResponse> viewDetailLead(@PathVariable Integer id) {
        LeadResponse response = leadService.getLeadById(id);
        return ApiResponse.<LeadResponse>builder()
                .data(response)
                .build();
    }
    @Operation(summary = "Xem danh sách khách hàng tiềm năng ")
    @GetMapping("/search")
    public ApiResponse<SimplePage<LeadResponse>> getAll(
            @RequestBody @Valid LeadRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<LeadResponse>>builder()
                .data(leadService.getAllLeads(pageable,filter))
                .build();
    }
    @Operation(summary = "Thay đổi status (bật tắt) khách hàng tiềm năng ")
    @PostMapping("/{id}/change-status")
    public ApiResponse<LeadResponse> changeStatusLead(@PathVariable Integer id) {
        LeadResponse response = leadService.changeStatusLead(id);
        return ApiResponse.<LeadResponse>builder()
                .data(response)
                .build();
    }

}
