package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicTwinDto {

    private UUID studentId;
    private String studentNumber;
    private String studentName;
    private String programName;

    private BigDecimal currentCgpa;
    private Integer creditsCompleted;
    private Integer totalCreditsRequired;

    private BigDecimal attendanceRate; // 0-100 %
    private BigDecimal assessmentAvg; // 0-100 %
    private BigDecimal submissionRate; // 0-100 %
    private BigDecimal engagementScore; // 0-100 %
    private String trendSlope; // IMPROVING, STABLE, DECLINING

    private BigDecimal healthScore; // 0-100
    private String statusTier; // EXCELLENT, HEALTHY, ATTENTION, CRITICAL

    private HealthScoreBreakdownDto healthBreakdown;
    private List<String> recommendations;
    private OffsetDateTime lastUpdated;
}
