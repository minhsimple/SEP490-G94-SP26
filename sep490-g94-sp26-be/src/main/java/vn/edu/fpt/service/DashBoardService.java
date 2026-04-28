package vn.edu.fpt.service;

import jakarta.validation.Valid;
import vn.edu.fpt.dto.request.dashboard.AdminDashBoardRequest;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.dashboard.AdminDashBoardResponse;

import java.util.List;

public interface DashBoardService {
    AdminDashBoardResponse getAdminDashBoard(AdminDashBoardRequest request);
}
