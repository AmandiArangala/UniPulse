package com.unipulse.unipulse_backend.dto.enrollment;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleGradeSummaryDto {

    private UUID enrollmentId;

    private UUID moduleId;

    private String moduleCode;

    private String moduleTitle;

    private BigDecimal creditHours;

    private Boolean isGpa;

    private BigDecimal caWeightPercentage;

    private BigDecimal weWeightPercentage;

    private BigDecimal caScoreObtained;

    private BigDecimal weScoreObtained;

    private BigDecimal finalGrade;

    private String letterGrade;

    private BigDecimal gradePoint;

    private Boolean meetsComponentThreshold;

    private List<AssessmentScoreBreakdownDto> assessmentBreakdowns;
}
