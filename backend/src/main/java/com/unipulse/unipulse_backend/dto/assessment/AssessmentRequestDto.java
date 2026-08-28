package com.unipulse.unipulse_backend.dto.assessment;

import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentRequestDto {

    @NotNull(message = "Module ID is required")
    private UUID moduleId;

    @NotNull(message = "Semester ID is required")
    private UUID semesterId;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @NotNull(message = "Assessment type is required")
    private AssessmentType type;

    @NotNull(message = "Weight percentage is required")
    @DecimalMin(value = "0.01", message = "Weight percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Weight percentage cannot exceed 100")
    private BigDecimal weightPercentage;

    @NotNull(message = "Max score is required")
    @DecimalMin(value = "1.00", message = "Max score must be at least 1")
    private BigDecimal maxScore;

    private OffsetDateTime dueDate;

    @Valid
    private List<AssessmentTopicRequestDto> topics;
}
