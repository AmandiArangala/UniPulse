package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamScenarioRowDto {

    private BigDecimal examScore;           // e.g. 0.00, 30.00, 40.00, 50.00, 60.00, 70.00, 80.00, 90.00, 100.00
    private BigDecimal predictedFinalMark;   // Weighted final course score out of 100
    private String predictedLetter;          // A+, A, A-, B+, B, B-, C+, C, C-, D, F
    private BigDecimal predictedGpaPoints;   // 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, etc.
    private BigDecimal deltaToTarget;        // Difference from target mark (e.g. +5.00% or -2.50%)
    private Boolean meetsTarget;             // Whether predicted final mark >= target mark
    private String statusLabel;              // e.g. "Target Secured", "Above Target", "Pass Threshold", "At Risk"
    private String gradeClassification;      // e.g. "First Class (4.0)", "Upper Second (3.3)", "Pass (2.0)"
}
