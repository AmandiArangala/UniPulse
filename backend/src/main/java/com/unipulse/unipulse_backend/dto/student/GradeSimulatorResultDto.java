package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeSimulatorResultDto {

    private String moduleCode;
    private String moduleTitle;
    private BigDecimal targetTotalMark;
    private String targetGradeLetter;

    private BigDecimal currentWeightedTotal;  // Earned points so far out of 100
    private BigDecimal completedWeight;        // Sum of weights of completed assessments
    private BigDecimal remainingWeight;        // Sum of weights of uncompleted assessments

    private BigDecimal requiredMarkOnRemaining; // Mark required on remaining weight to hit target
    private Boolean isAchievable;              // True if requiredMarkOnRemaining <= 100.00
    private String statusMessage;               // Advisory explanation
    private String formulaApplied;              // Formula text description

    private DynamicScenarioMatrixDto scenarioMatrix;
}
