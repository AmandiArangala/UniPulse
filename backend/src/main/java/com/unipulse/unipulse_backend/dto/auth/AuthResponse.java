package com.unipulse.unipulse_backend.dto.auth;

import com.unipulse.unipulse_backend.model.enums.UserRole;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private UUID userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
}
