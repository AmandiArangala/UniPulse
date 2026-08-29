package com.unipulse.unipulse_backend.dto.student;

import com.unipulse.unipulse_backend.dto.enrollment.ModuleGradeSummaryDto;
import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhatIfGpaSimulationResponseDto {

    private UUID studentId;

    private BigDecimal currentCgpa;

    private AcademicDegreeClass currentDegreeClass;

    private BigDecimal simulatedSgpa;

    private BigDecimal simulatedCgpa;

    private AcademicDegreeClass simulatedDegreeClass;

    private BigDecimal gpaDelta;

    private List<ModuleGradeSummaryDto> moduleSimulations;
}
