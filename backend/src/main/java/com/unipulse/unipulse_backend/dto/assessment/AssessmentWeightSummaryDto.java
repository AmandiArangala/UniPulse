package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentWeightSummaryDto {

    private UUID moduleId;
    private String moduleCode;
    private String moduleTitle;
    private UUID semesterId;
    private String semesterName;
    private BigDecimal totalWeightPercentage;
    private BigDecimal remainingWeightPercentage;
    private Boolean isBalanced;
    private Boolean isOverAllocated;
    private Integer totalAssessmentsCount;
    private List<AssessmentResponseDto> assessments;
}
