package com.unipulse.unipulse_backend.dto.advisor;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvisorCaseloadSummaryDto {

    private UUID advisorId;
    private String advisorName;
    private String departmentName;
    private Integer totalAssignedStudents;
    private Integer totalOpenInterventions;
    private Integer atRiskCount;
    private Integer probationCount;
    private Integer goodStandingCount;
    private BigDecimal averageCaseloadGpa;
    private BigDecimal averageAttendanceRate;
}
