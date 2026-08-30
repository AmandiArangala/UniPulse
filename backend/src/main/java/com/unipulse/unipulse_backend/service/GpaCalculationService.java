package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentAnalyticsDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleGradeSummaryDto;
import com.unipulse.unipulse_backend.dto.student.SemesterGpaReportDto;
import com.unipulse.unipulse_backend.dto.student.StudentGpaSummaryDto;
import com.unipulse.unipulse_backend.dto.student.TargetGpaProjectionDto;
import com.unipulse.unipulse_backend.dto.student.WhatIfGpaSimulationRequestDto;
import com.unipulse.unipulse_backend.dto.student.WhatIfGpaSimulationResponseDto;

import java.util.UUID;

public interface GpaCalculationService {

    ModuleGradeSummaryDto calculateAndPersistModuleGrade(UUID studentId, UUID moduleId, UUID semesterId);

    SemesterGpaReportDto calculateSemesterGpa(UUID studentId, UUID semesterId);

    StudentGpaSummaryDto calculateCumulativeGpa(UUID studentId);

    TargetGpaProjectionDto computeDegreeClassTrajectory(UUID studentId);

    WhatIfGpaSimulationResponseDto simulateWhatIfGpa(UUID studentId, WhatIfGpaSimulationRequestDto request);

    AssessmentAnalyticsDto computeAssessmentAnalytics(UUID assessmentId);
}
