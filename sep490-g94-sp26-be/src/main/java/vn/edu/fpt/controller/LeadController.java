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
    @Operation(summary = "Lấy tất cả danh sách khách hàng tiềm năng ")
    @GetMapping("/get-all")
    public ApiResponse<SimplePage<LeadResponse>> getAll(
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<LeadResponse>>builder()
                .data(leadService.getAllLeads(pageable))
                .build();
    }

//    @GetMapping("/{id}")
//    public LeadResponse getLeadById(@PathVariable Integer id) {
//        return leadService.getById(id);
//    }
//
//    @Operation(summary = "Xem danh sách hợp đồng")
//    @PostMapping("/search")
//    public ApiResponse<SimplePage<ContractFilterForOfficialResponse>> filterContractForOfficial(
//            @RequestBody ContractFilterForOfficialRequest filter,
//            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
//                    sort = Constants.SORT.SORT_BY,
//                    direction = Sort.Direction.DESC) Pageable pageable) {
//        return ApiResponse.<SimplePage<ContractFilterForOfficialResponse>>builder()
//                .data(contractService.filterContractForOfficial(filter, pageable))
//                .build();
//    }

}
