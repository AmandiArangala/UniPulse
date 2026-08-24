package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.auth.*;
import com.unipulse.unipulse_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(Collections.singletonMap("message",
                "If an account with that email exists, password reset instructions have been processed."));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<Map<String, String>> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.ok(Collections.singletonMap("message",
                "Password has been reset successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        UserProfileResponse profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/test/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> testAdminAccess() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Access Granted: ADMIN Role Verified"));
    }

    @GetMapping("/test/lecturer")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR')")
    public ResponseEntity<Map<String, String>> testLecturerAccess() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Access Granted: LECTURER or ADVISOR Role Verified"));
    }

    @GetMapping("/test/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> testStudentAccess() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Access Granted: STUDENT Role Verified"));
    }
}
