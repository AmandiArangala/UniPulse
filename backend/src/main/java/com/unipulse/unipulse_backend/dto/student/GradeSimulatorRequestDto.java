package com.unipulse.unipulse_backend.dto.student;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeSimulatorRequestDto {

    private UUID studentId;
    private String moduleId;
    private String moduleCode;
    private String moduleTitle;

    @NotNull(message = "Target total mark is required")
    @DecimalMin(value = "0.00", message = "Target total mark cannot be negative")
    @DecimalMax(value = "100.00", message = "Target total mark cannot exceed 100%")
    private BigDecimal targetTotalMark;

    private String targetGradeLetter;

    @NotEmpty(message = "Assessments list cannot be empty")
    @Valid
    private List<AssessmentScoreInput> assessments;
}
