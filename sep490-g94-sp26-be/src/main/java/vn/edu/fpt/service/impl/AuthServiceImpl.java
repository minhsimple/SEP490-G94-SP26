package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.AuthResponse;
import vn.edu.fpt.dto.LoginRequest;
import vn.edu.fpt.dto.RefreshTokenRequest;
import vn.edu.fpt.dto.RegisterRequest;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.UserRepository;
import vn.edu.fpt.security.JwtTokenUtil;
import vn.edu.fpt.service.AuthService;

/**
 * Implementation of AuthService for authentication operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        validateEmailNotExists(request.getEmail());

        User user = createUser(request);
        user = userRepository.save(user);

        log.info("User registered successfully with id: {}", user.getId());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt for email: {}", request.getEmail());

        authenticateUser(request.getEmail(), request.getPassword());

        User user = findUserByEmail(request.getEmail());

        log.info("User logged in successfully with id: {}", user.getId());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        validateRefreshToken(refreshToken);

        String email = jwtTokenUtil.extractUsername(refreshToken);
        User user = findUserByEmail(email);

        String newAccessToken = jwtTokenUtil.generateTokenWithUserId(user.getEmail(), user.getId());

        log.info("Token refreshed successfully for user: {}", user.getId());
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return findUserByEmail(email);
    }

    // ==================== Private Helper Methods ====================

    private void validateEmailNotExists(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
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
                new UsernamePasswordAuthenticationToken(email, password)
        );
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));
    }

    private User createUser(RegisterRequest request) {
        return User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .status(RecordStatus.ACTIVE)
                .build();
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenUtil.generateTokenWithUserId(user.getEmail(), user.getId());
        String refreshToken = jwtTokenUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}

