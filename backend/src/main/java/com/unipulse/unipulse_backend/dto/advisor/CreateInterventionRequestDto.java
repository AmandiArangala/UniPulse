package com.unipulse.unipulse_backend.dto.advisor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInterventionRequestDto {

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    private UUID moduleId;

    @NotBlank(message = "Intervention type is required")
    private String interventionType;

    private String priority;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String followUpDate;

    private String notes;
}
