package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.dashboard.AccountantDashBoardResponse;
import vn.edu.fpt.dto.response.dashboard.AdminDashBoardResponse;
import vn.edu.fpt.dto.response.hall.HallResponse;
import vn.edu.fpt.service.DashBoardService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashBoardController {
//    DashBoardService dashBoardService;
//    public ApiResponse<AdminDashBoardResponse> getAdminDashBoard(
//            @RequestPart("request") @Valid HallRequest request) throws Exception {
//        HallResponse response = dashBoardService.getAdminDashBoard(request);
//        return ApiResponse.<AdminDashBoardResponse>builder()
//                .data(response)
//                .build();
//    }
//
//    public ApiResponse<AdminDashBoardResponse> getAdminDashBoard(
//            @RequestPart("request") @Valid HallRequest request) throws Exception {
//        HallResponse response = dashBoardService.getSaleDashBoard(request);
//        return ApiResponse.<AdminDashBoardResponse>builder()
//                .data(response)
//                .build();
//    }
//
//    public ApiResponse<AdminDashBoardResponse> getAdminDashBoard(
//            @RequestPart("request") @Valid HallRequest request) throws Exception {
//        HallResponse response = dashBoardService.getCoordinatorDashBoard(request);
//        return ApiResponse.<AdminDashBoardResponse>builder()
//                .data(response)
//                .build();
//    }
//
//    public ApiResponse<AccountantDashBoardResponse> getAdminDashBoard(
//            @RequestPart("request") @Valid HallRequest request) throws Exception {
//        HallResponse response = dashBoardService.getAccountantDashBoard(request);
//        return ApiResponse.<AccountantDashBoardResponse>builder()
//                .data(response)
//                .build();
//    }
}
