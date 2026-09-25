package com.unipulse.unipulse_backend.dto.student;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TargetGpaGoalRequestDto {

    private UUID studentId;

    @NotNull(message = "Current CGPA is required")
    @DecimalMin(value = "0.00", message = "CGPA cannot be negative")
    @DecimalMax(value = "4.00", message = "CGPA cannot exceed 4.00")
    private BigDecimal currentCgpa;

    @NotNull(message = "Earned credits count is required")
    @Min(value = 0, message = "Earned credits cannot be negative")
    private Integer earnedCredits;

    @NotNull(message = "Total degree credits is required")
    @Min(value = 1, message = "Total degree credits must be at least 1")
    private Integer totalDegreeCredits;

    @NotNull(message = "Target CGPA is required")
    @DecimalMin(value = "0.00", message = "Target CGPA cannot be negative")
    @DecimalMax(value = "4.00", message = "Target CGPA cannot exceed 4.00")
    private BigDecimal targetCgpa;

    private Integer plannedSemestersRemaining;
}
