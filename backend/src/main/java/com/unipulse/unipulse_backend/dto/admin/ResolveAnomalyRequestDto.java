package com.unipulse.unipulse_backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolveAnomalyRequestDto {

    @NotBlank(message = "Resolution action is required")
    private String action; // NOTIFY_LECTURER, REPAIR_ENROLLMENT, PURGE_RECORD, DISMISS

    private String notes;
}
