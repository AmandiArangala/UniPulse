package com.unipulse.unipulse_backend.dto.enrollment;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleEnrollmentRequestDto {

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Module ID is required")
    private UUID moduleId;

    @NotNull(message = "Semester ID is required")
    private UUID semesterId;
}
