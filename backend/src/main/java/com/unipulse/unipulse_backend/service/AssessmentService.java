package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.assessment.*;

import java.util.List;
import java.util.UUID;

public interface AssessmentService {

    AssessmentResponseDto createAssessment(AssessmentRequestDto dto);

    AssessmentResponseDto getAssessmentById(UUID id);

    List<AssessmentResponseDto> getAssessmentsByModuleAndSemester(UUID moduleId, UUID semesterId);

    AssessmentResponseDto updateAssessment(UUID id, AssessmentRequestDto dto);

    void deleteAssessment(UUID id);

    AssessmentTopicResponseDto addTopicToAssessment(UUID assessmentId, AssessmentTopicRequestDto topicDto);

    void removeTopicFromAssessment(UUID assessmentId, UUID topicId);

    List<AssessmentTopicResponseDto> getTopicsByAssessment(UUID assessmentId);

    TopicCoverageReportDto getTopicDiagnosticReport(UUID moduleId, UUID semesterId);

    List<AssessmentResponseDto> publishAssessmentStructure(UUID moduleId, UUID semesterId);
}
