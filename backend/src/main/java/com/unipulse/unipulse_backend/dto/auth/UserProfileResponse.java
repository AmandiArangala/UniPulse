package com.unipulse.unipulse_backend.dto.auth;

import com.unipulse.unipulse_backend.model.enums.UserRole;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private Boolean isActive;
    private OffsetDateTime createdAt;
}
