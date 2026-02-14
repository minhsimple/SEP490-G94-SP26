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
import vn.edu.fpt.dto.request.lead.LeadsFilterRequest;
import vn.edu.fpt.dto.request.user.UserFilterRequest;
import vn.edu.fpt.dto.request.user.UserRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.UserResponse;
import vn.edu.fpt.dto.response.lead.LeadResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.UserService;

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @Operation(summary = "Xem danh sách tai khoan nguoi dung ")
    @PostMapping("/search")
    public ApiResponse<SimplePage<UserResponse>> getAll(
            @RequestBody @Valid UserFilterRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<UserResponse>>builder()
                .data(userService.getAllUsers(pageable,filter))
                .build();
    }

    @Operation(summary = "Thay đổi status (bật tắt) tai khoan nguoi dung ")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<UserResponse> changeStatus(@PathVariable Integer id) {
        UserResponse response = userService.changeStatus(id);
        return ApiResponse.<UserResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Tạo tai khoan nguoi dung")
    @PostMapping("/create")
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserRequest request) {
        UserResponse response = userService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .data(response)
                .build();
    }
    @Operation(summary = "Cập nhật tài khoản người dùng")
    @PutMapping("/{id}/update")
    public ApiResponse<UserResponse> updateLead(@RequestBody @Valid UserRequest request,
                                                @PathVariable Integer id) {
        UserResponse response = userService.updateUser(id,request);
        return ApiResponse.<UserResponse>builder()
                .data(response)
                .build();
    }

}
