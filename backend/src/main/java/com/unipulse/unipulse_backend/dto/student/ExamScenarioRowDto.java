package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamScenarioRowDto {

    private BigDecimal examScore;           // e.g. 40.00, 50.00, 60.00, 70.00, 80.00, 90.00, 100.00
    private BigDecimal predictedFinalMark;   // Weighted final course score
    private String predictedLetter;          // A, A-, B+, B, etc.
    private BigDecimal predictedGpaPoints;   // 4.0, 3.7, 3.3, 3.0, etc.
    private Boolean meetsTarget;             // Whether predicted final mark >= target mark
    private String statusLabel;              // e.g. "Pass", "Target Met", "First Class Target"
}
