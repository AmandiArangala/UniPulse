package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.DynamicScenarioMatrixDto;
import com.unipulse.unipulse_backend.dto.student.GradeSimulatorRequestDto;
import com.unipulse.unipulse_backend.dto.student.GradeSimulatorResultDto;
import com.unipulse.unipulse_backend.dto.student.TargetGpaGoalRequestDto;
import com.unipulse.unipulse_backend.dto.student.TargetGpaGoalResultDto;

public interface GradeSimulatorService {

    /**
     * Calculates the required score percentage on remaining assessments to achieve target course mark.
     * Formula: Required Mark = (Target Total - Current Weighted Total) / Remaining Weight
     */
    GradeSimulatorResultDto calculateRequiredMark(GradeSimulatorRequestDto request);

    /**
     * Generates a dynamic scenario matrix mapping final exam scores (40%-100%) to predicted final marks and grades.
     */
    DynamicScenarioMatrixDto generateScenarioMatrix(GradeSimulatorRequestDto request);

    /**
     * Calculates required remaining GPA and grade combination strategies to achieve target CGPA.
     */
    TargetGpaGoalResultDto calculateGpaGoalPlan(TargetGpaGoalRequestDto request);
}
