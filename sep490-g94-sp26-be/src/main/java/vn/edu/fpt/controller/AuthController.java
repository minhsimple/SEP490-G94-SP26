package vn.edu.fpt.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import vn.edu.fpt.dto.*;
import vn.edu.fpt.entity.User;
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

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ApiResponse.<AuthResponse>builder()
                .message("Token refreshed successfully")
                .data(response)
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = authService.getCurrentUser(email);
        return ApiResponse.<User>builder()
                .message("User retrieved successfully")
                .data(user)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        SecurityContextHolder.clearContext();
        return ApiResponse.<Void>builder()
                .message("Logout successful")
                .build();
    }
}

