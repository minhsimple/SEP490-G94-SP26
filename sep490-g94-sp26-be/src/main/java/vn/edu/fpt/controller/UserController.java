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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.lead.LeadsFilterRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.UserResponse;
import vn.edu.fpt.dto.response.lead.LeadResponse;
import vn.edu.fpt.enums.Constants;

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    @Operation(summary = "Xem danh sách tai khoan nguoi dung ")
    @PostMapping("/search")
    public ApiResponse<SimplePage<UserResponse>> getAll(
            @RequestBody @Valid LeadsFilterRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<UserResponse>>builder()
                .data(leadService.getAllLeads(pageable,filter))
                .build();
    }
}
