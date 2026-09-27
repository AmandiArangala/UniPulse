package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthScoreBreakdownDto {

    private BigDecimal academicPerformanceScore; // 0-100
    private BigDecimal academicPerformanceWeight; // 0.40
    private BigDecimal academicPerformanceContribution;

    private BigDecimal attendanceScore; // 0-100
    private BigDecimal attendanceWeight; // 0.20
    private BigDecimal attendanceContribution;

    private BigDecimal submissionScore; // 0-100
    private BigDecimal submissionWeight; // 0.15
    private BigDecimal submissionContribution;

    private BigDecimal engagementScore; // 0-100
    private BigDecimal engagementWeight; // 0.15
    private BigDecimal engagementContribution;

    private BigDecimal trendScore; // 0-100
    private BigDecimal trendWeight; // 0.10
    private BigDecimal trendContribution;

    private BigDecimal totalHealthScore; // 0-100
    private String statusTier; // EXCELLENT, HEALTHY, ATTENTION, CRITICAL
    private String trendSlope; // IMPROVING, STABLE, DECLINING
    private String formulaDescription;
}
