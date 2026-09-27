package com.unipulse.unipulse_backend.dto.student;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentScoreInput {

    private String id;

    @NotBlank(message = "Assessment title is required")
    private String title;

    private String type; // QUIZ, ASSIGNMENT, MIDTERM, FINAL_EXAM, PROJECT

    @NotNull(message = "Assessment weight is required")
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0")
    @DecimalMax(value = "100.00", message = "Weight cannot exceed 100%")
    private BigDecimal weight; // e.g. 35.00 for 35%

    @NotNull(message = "Assessment score is required")
    @DecimalMin(value = "0.00", message = "Score cannot be negative")
    @DecimalMax(value = "100.00", message = "Score cannot exceed 100%")
    private BigDecimal score; // 0-100 score

    private Boolean isCompleted;
}
