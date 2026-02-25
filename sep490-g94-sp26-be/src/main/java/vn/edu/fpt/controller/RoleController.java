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
import vn.edu.fpt.dto.request.role.RoleRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.role.RoleResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.RoleService;

@RestController
@RequestMapping("/api/v1/role")
@Tag(name = "Role")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleService roleService;

    @Operation(summary = "Create new role")
    @PostMapping("/create")
    public ApiResponse<RoleResponse> createRole(@RequestBody @Valid RoleRequest request) {
        RoleResponse response = roleService.createRole(request);
        return ApiResponse.<RoleResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Update role")
    @PutMapping("/update")
    public ApiResponse<RoleResponse> updateRole(@RequestParam Integer roleId,
                                                @RequestBody @Valid RoleRequest request) {
        RoleResponse response = roleService.updateRole(roleId, request);
        return ApiResponse.<RoleResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Get role detail")
    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> viewDetailRole(@PathVariable Integer id) {
        RoleResponse response = roleService.getRoleById(id);
        return ApiResponse.<RoleResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Search roles")
    @GetMapping("/search")
    public ApiResponse<SimplePage<RoleResponse>> getAllRoles(
            @Valid RoleRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<RoleResponse>>builder()
                .data(roleService.getAllRoles(pageable, filter))
                .build();
    }

    @Operation(summary = "Toggle role status (activate/deactivate)")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<RoleResponse> changeRoleStatus(@PathVariable Integer id) {
        RoleResponse response = roleService.changeRoleStatus(id);
        return ApiResponse.<RoleResponse>builder()
                .data(response)
                .build();

    }
}
