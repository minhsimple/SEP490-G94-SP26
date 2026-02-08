package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.response.AuthResponse;
import vn.edu.fpt.dto.request.LoginRequest;
import vn.edu.fpt.dto.request.RegisterRequest;
import vn.edu.fpt.entity.RefreshToken;
import vn.edu.fpt.entity.Role;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.RefreshTokenRepository;
import vn.edu.fpt.respository.RoleRepository;
import vn.edu.fpt.respository.UserRepository;
import vn.edu.fpt.security.JwtTokenUtil;
import vn.edu.fpt.service.AuthService;

import java.time.LocalDateTime;

/**
 * Implementation of AuthService for authentication operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshExpiration;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateEmailNotExists(request.getEmail());

        User user = createUser(request);
        user = userRepository.save(user);

//        return buildAuthResponse(user);
        // Chỉ trả về thông tin user, không tạo token (user phải login riêng)
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt for email: {}", request.getEmail());

        try {
            authenticateUser(request.getEmail(), request.getPassword());
        } catch (Exception ex) {
            throw new AppException(ERROR_CODE.USER_NOT_EXISTED);
        }

        User user = findUserByEmail(request.getEmail());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        // Validate JWT signature and expiration
        validateRefreshToken(refreshTokenStr);

        // Find refresh token in database and validate it's not revoked
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenStr)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVALID_REFRESH_TOKEN));

        if (!refreshToken.isValid()) {
            throw new AppException(ERROR_CODE.INVALID_REFRESH_TOKEN);
        }

        // Get user by userId from refresh token
        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));

        String newAccessToken = jwtTokenUtil.generateTokenWithUserId(user.getEmail(), user.getId());

        log.info("Token refreshed successfully for user: {}", user.getId());
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        log.info("Logout request received");

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("Refresh token revoked for userId: {}", token.getUserId());
                });
    }

    @Override
    @Transactional
    public void logoutAllDevices(String token) {
        log.info("Logout all devices request received");

        // Extract email from token
        String email = jwtTokenUtil.extractUsername(token);
        User user = findUserByEmail(email);
        refreshTokenRepository.revokeAllTokensByUserId(user.getId());

        log.info("All refresh tokens revoked for user: {}", user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        User currentUser = userRepository.findByEmailAndIsActive(email, true)
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));
        Role role = roleRepository
                .findById(currentUser.getRole_id())
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));
        return findUserByEmail(email);
    }

    // ==================== Private Helper Methods ====================

    private void validateEmailNotExists(String email) {
        if (userRepository.findByEmailAndIsActive(email, true).isPresent()) {
            throw new AppException(ERROR_CODE.USER_EXISTED);
        }
    }

    private void validateRefreshToken(String refreshToken) {
        if (!jwtTokenUtil.validateToken(refreshToken)) {
            throw new AppException(ERROR_CODE.INVALID_REFRESH_TOKEN);
        }
    }

    private void authenticateUser(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndIsActive(email, true)
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));
    }

    private User createUser(RegisterRequest request) {
        return User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .status(RecordStatus.active)
                .build();
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenUtil.generateTokenWithUserId(user.getEmail(), user.getId());
        String refreshTokenStr = jwtTokenUtil.generateRefreshToken(user.getEmail());

        // Save refresh token to database
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
