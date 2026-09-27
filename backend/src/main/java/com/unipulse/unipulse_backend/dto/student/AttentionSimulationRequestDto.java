package com.unipulse.unipulse_backend.dto.student;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttentionSimulationRequestDto {

    private UUID studentId;

    @DecimalMin(value = "0.0", message = "Attendance rate must be >= 0%")
    @DecimalMax(value = "100.0", message = "Attendance rate must be <= 100%")
    private BigDecimal attendanceRate;

    @DecimalMin(value = "0.0", message = "Average mark must be >= 0%")
    @DecimalMax(value = "100.0", message = "Average mark must be <= 100%")
    private BigDecimal averageMark;

    @Min(value = 0, message = "Missed tests count cannot be negative")
    private Integer missedTestsCount;

    private String trendSlope; // "IMPROVING", "STABLE", "DECLINING"

    @DecimalMin(value = "0.0", message = "Engagement score must be >= 0%")
    @DecimalMax(value = "100.0", message = "Engagement score must be <= 100%")
    private BigDecimal engagementScore;
}
