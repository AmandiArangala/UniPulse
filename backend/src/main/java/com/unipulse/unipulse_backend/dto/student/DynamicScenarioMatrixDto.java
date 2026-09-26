package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamicScenarioMatrixDto {

    private String moduleCode;
    private BigDecimal currentWeightedTotal;
    private BigDecimal remainingWeight;
    private BigDecimal targetMark;

    private BigDecimal bestPossibleMark;         // Final score if exam score = 100%
    private BigDecimal worstPossibleMark;        // Final score if exam score = 0%

    private BigDecimal minimumScoreToPass;       // Minimum exam score needed for 45% course pass
    private BigDecimal minimumScoreForTarget;    // Minimum exam score needed to achieve targetMark
    private BigDecimal minimumScoreForFirstClass;// Minimum exam score needed for 75% A grade

    private List<ExamScenarioRowDto> scenarios;
}
