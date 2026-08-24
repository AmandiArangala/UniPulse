package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.auth.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void requestPasswordReset(PasswordResetRequest request);
    void confirmPasswordReset(PasswordResetConfirmRequest request);
    UserProfileResponse getCurrentUserProfile();
}
