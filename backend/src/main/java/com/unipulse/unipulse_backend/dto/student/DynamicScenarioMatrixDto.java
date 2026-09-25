package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamicScenarioMatrixDto {

    private String moduleCode;
    private BigDecimal currentWeightedTotal;
    private BigDecimal remainingWeight;
    private BigDecimal targetMark;
    private List<ExamScenarioRowDto> scenarios;
}
