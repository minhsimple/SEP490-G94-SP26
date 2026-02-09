package vn.edu.fpt.service;

import vn.edu.fpt.dto.response.AuthResponse;
import vn.edu.fpt.dto.request.LoginRequest;
import vn.edu.fpt.dto.request.RegisterRequest;
import vn.edu.fpt.entity.User;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Register a new user.
     *
     * @param request the registration request containing user details
     * @return AuthResponse with tokens and user information
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate a user and generate tokens.
     *
     * @param request the login request containing credentials
     * @return AuthResponse with tokens and user information
     */
    AuthResponse login(LoginRequest request);

    /**
     * Refresh the access token using a valid refresh token.
     *
     * @param refreshToken the refresh token from Authorization header
     * @return AuthResponse with new access token
     */
    AuthResponse refreshToken(String refreshToken);

    /**
     * Get the current user by email.
     *
     * @param email the user's email
     * @return the User entity
     */
    User getCurrentUser(String email);

    /**
     * Logout user by revoking the refresh token.
     *
     * @param refreshToken the refresh token to revoke
     */
    void logout(String refreshToken);

    /**
     * Logout user from all devices by revoking all refresh tokens.
     *
     * @param token the access token or refresh token to extract user
     */
    void logoutAllDevices(String token);
}

