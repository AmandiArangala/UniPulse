package com.unipulse.unipulse_backend.dto.assessment;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentTopicRequestDto {

    @NotBlank(message = "Topic name is required")
    private String topicName;

    @DecimalMin(value = "0.00", message = "Weight contribution cannot be negative")
    @DecimalMax(value = "100.00", message = "Weight contribution cannot exceed 100")
    private BigDecimal weightContribution;

    private String description;
}
