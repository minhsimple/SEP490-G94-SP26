package vn.edu.fpt.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import vn.edu.fpt.dto.request.authorization.LoginRequest;
import vn.edu.fpt.dto.request.authorization.RegisterRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.AuthResponse;
import vn.edu.fpt.dto.response.UserResponse;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.<AuthResponse>builder()
                .message("User registered successfully")
                .data(response)
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.<AuthResponse>builder()
                .message("Login successful")
                .data(response)
                .build();
    }

    // sử dụng khi access token hết hạn, lấy access token mới
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(HttpServletRequest request) {
        String refreshToken = extractTokenFromRequest(request);
        if (refreshToken == null) {
            throw new AppException(ERROR_CODE.INVALID_REFRESH_TOKEN);
        }
        AuthResponse response = authService.refreshToken(refreshToken);
        return ApiResponse.<AuthResponse>builder()
                .message("Token refreshed successfully")
                .data(response)
                .build();
    }

    // Lấy thông tin user hiện tại
    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ERROR_CODE.UNAUTHENTICATED);
        }
        String email = authentication.getName();
        return ApiResponse.<UserResponse>builder()
                .data(authService.getCurrentUser(email))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        String refreshToken = extractTokenFromRequest(request);
        if (refreshToken == null) {
            throw new AppException(ERROR_CODE.INVALID_REFRESH_TOKEN);
        }
        authService.logout(refreshToken);
        SecurityContextHolder.clearContext();
        return ApiResponse.<Void>builder()
                .message("Logout successful")
                .build();
    }

    @PostMapping("/logout-all")
    public ApiResponse<Void> logoutAllDevices(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new AppException(ERROR_CODE.UNAUTHENTICATED);
        }
        authService.logoutAllDevices(token);
        SecurityContextHolder.clearContext();
        return ApiResponse.<Void>builder()
                .message("Logged out from all devices successfully")
                .build();
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}

