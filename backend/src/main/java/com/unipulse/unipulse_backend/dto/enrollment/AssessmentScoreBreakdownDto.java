package com.unipulse.unipulse_backend.dto.enrollment;

import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentScoreBreakdownDto {

    private UUID assessmentId;

    private String assessmentTitle;

    private AssessmentType assessmentType;

    private BigDecimal weightPercentage;

    private BigDecimal maxScore;

    private BigDecimal scoreObtained;

    private BigDecimal percentageScore;

    private BigDecimal weightedContribution;
}
