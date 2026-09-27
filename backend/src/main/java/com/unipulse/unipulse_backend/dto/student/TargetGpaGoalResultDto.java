package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TargetGpaGoalResultDto {

    private BigDecimal currentCgpa;
    private BigDecimal targetCgpa;
    private Integer earnedCredits;
    private Integer totalDegreeCredits;
    private Integer remainingCredits;

    private String currentHonoursClassification;
    private String targetHonoursClassification;

    private BigDecimal requiredRemainingGpa;  // (Target CGPA * Total Credits - Current CGPA * Earned Credits) / Remaining Credits
    private BigDecimal maxPossibleCgpa;        // CGPA if student scores 4.00 on all remaining credits

    private Boolean isFeasible;                // True if requiredRemainingGpa <= 4.00
    private String feasibilityStatus;          // ACHIEVABLE, STRETCH, UNREALISTIC, IMPOSSIBLE
    private String statusSummary;              // Detailed guidance message
    private String formulaApplied;             // Description of math formula

    private List<GradeCombinationStrategyDto> recommendedStrategies;
}
