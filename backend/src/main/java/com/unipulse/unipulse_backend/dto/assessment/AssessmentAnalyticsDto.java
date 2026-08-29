package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAnalyticsDto {

    private UUID assessmentId;

    private String assessmentTitle;

    private Integer totalSubmissions;

    private BigDecimal meanScore;

    private BigDecimal medianScore;

    private BigDecimal highestScore;

    private BigDecimal lowestScore;

    private BigDecimal standardDeviation;

    private BigDecimal passRatePercentage;

    private Map<String, Integer> gradeDistribution;
}
