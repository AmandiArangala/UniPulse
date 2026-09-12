package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.advisor.*;

import java.util.List;
import java.util.UUID;

public interface AdvisorService {

    AdvisorCaseloadSummaryDto getCaseloadSummary(UUID advisorId);

    List<AssignedStudentDto> getAssignedStudents(UUID advisorId, String search, UUID departmentId, String status);

    Student360DetailDto getStudent360(UUID studentId);

    List<AcademicInterventionDto> getInterventions(UUID advisorId, String status);

    AcademicInterventionDto createIntervention(UUID advisorId, CreateInterventionRequestDto dto);

    AcademicInterventionDto updateInterventionStatus(UUID interventionId, UpdateInterventionStatusDto dto);
}
