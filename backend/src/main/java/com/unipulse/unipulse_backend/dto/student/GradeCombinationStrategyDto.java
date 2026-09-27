package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeCombinationStrategyDto {

    private String strategyName;        // e.g. "Straight A Performance", "Balanced Mix (3 A's, 1 B+)", "Minimum Threshold"
    private BigDecimal targetSemesterGpa; // e.g. 3.75
    private String gradeMixPattern;    // e.g. "3x A (4.0), 1x B+ (3.3)"
    private String description;        // Guidance note
    private String feasibilityRating;  // EASY, MODERATE, STRETCH, UNREALISTIC, IMPOSSIBLE
}
