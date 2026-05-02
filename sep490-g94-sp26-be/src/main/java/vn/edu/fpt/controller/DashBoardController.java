package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.dashboard.AdminDashBoardRequest;
import vn.edu.fpt.dto.request.dashboard.AccountantDashBoardRequest;
import vn.edu.fpt.dto.request.dashboard.SaleDashBoardRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.dashboard.AccountantDashBoardResponse;
import vn.edu.fpt.dto.response.dashboard.AdminDashBoardResponse;
import vn.edu.fpt.dto.response.dashboard.SaleDashBoardResponse;
import vn.edu.fpt.service.DashBoardService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashBoardController {
    DashBoardService dashBoardService;

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Lấy dashboard quản lý theo địa điểm")
    @PostMapping("/search")
    public ApiResponse<AdminDashBoardResponse> getAdminDashBoard(
            @RequestBody @Valid AdminDashBoardRequest request) throws Exception {
        return ApiResponse.<AdminDashBoardResponse>builder()
                .data(dashBoardService.getAdminDashBoard(request))
                .build();
    }

    @PreAuthorize("hasRole('SALE')")
    @Operation(summary = "Lấy dashboard sale ")
    @PostMapping("/search-sale")
    public ApiResponse<SaleDashBoardResponse> getSaleDashBoard(
            @RequestBody @Valid SaleDashBoardRequest request) throws Exception {
        return ApiResponse.<SaleDashBoardResponse>builder()
                .data(dashBoardService.getSaleDashBoard(request))
                .build();
    }

    @PreAuthorize("hasRole('ACCOUNTANT')")
    @Operation(summary = "Lấy dashboard Acc ")
    @PostMapping("/search-coordinator")
    public ApiResponse<List<AccountantDashBoardResponse>> getAccountantDashBoard(
            @RequestBody @Valid AccountantDashBoardRequest request) throws Exception {
        return ApiResponse.<List<AccountantDashBoardResponse>>builder()
                .data(dashBoardService.getAccountantDashBoard(request))
                .build();
    }
//
//    public ApiResponse<AccountantDashBoardResponse> getAdminDashBoard(
//            @RequestPart("request") @Valid HallRequest request) throws Exception {
//        HallResponse response = dashBoardService.getAccountantDashBoard(request);
//        return ApiResponse.<AccountantDashBoardResponse>builder()
//                .data(response)
//                .build();
//    }
}
