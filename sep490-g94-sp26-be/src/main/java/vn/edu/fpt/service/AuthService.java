package vn.edu.fpt.service;

import vn.edu.fpt.dto.AuthResponse;
import vn.edu.fpt.dto.LoginRequest;
import vn.edu.fpt.dto.RefreshTokenRequest;
import vn.edu.fpt.dto.RegisterRequest;
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
     * @param request the refresh token request
     * @return AuthResponse with new access token
     */
    AuthResponse refreshToken(RefreshTokenRequest request);

    /**
     * Get the current user by email.
     *
     * @param email the user's email
     * @return the User entity
     */
    User getCurrentUser(String email);
}

