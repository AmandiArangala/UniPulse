package com.unipulse.unipulse_backend.dto.student;

import com.unipulse.unipulse_backend.dto.enrollment.ModuleGradeSummaryDto;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterGpaReportDto {

    private UUID semesterId;

    private String semesterName;

    private Integer academicYear;

    private BigDecimal sgpa;

    private BigDecimal semesterGpaCredits;

    private BigDecimal semesterNgpaCredits;

    private List<ModuleGradeSummaryDto> modules;
}
