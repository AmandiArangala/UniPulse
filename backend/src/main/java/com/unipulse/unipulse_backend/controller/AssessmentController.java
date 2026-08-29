package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.assessment.*;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.service.AssessmentService;
import com.unipulse.unipulse_backend.service.AssessmentWeightValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final AssessmentWeightValidationService weightValidationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentResponseDto>> createAssessment(@Valid @RequestBody AssessmentRequestDto dto) {
        AssessmentResponseDto response = assessmentService.createAssessment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Assessment created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentResponseDto>> getAssessmentById(@PathVariable UUID id) {
        AssessmentResponseDto response = assessmentService.getAssessmentById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Assessment retrieved successfully"));
    }

    @GetMapping("/module/{moduleId}/semester/{semesterId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AssessmentResponseDto>>> getAssessmentsByModuleAndSemester(
            @PathVariable UUID moduleId,
            @PathVariable UUID semesterId
    ) {
        List<AssessmentResponseDto> response = assessmentService.getAssessmentsByModuleAndSemester(moduleId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Module assessments retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentResponseDto>> updateAssessment(
            @PathVariable UUID id,
            @Valid @RequestBody AssessmentRequestDto dto
    ) {
        AssessmentResponseDto response = assessmentService.updateAssessment(id, dto);
        return ResponseEntity.ok(ApiResponse.success(response, "Assessment updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAssessment(@PathVariable UUID id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.ok(ApiResponse.success("Assessment deleted successfully"));
    }

    @GetMapping("/module/{moduleId}/semester/{semesterId}/weight-summary")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentWeightSummaryDto>> getWeightSummary(
            @PathVariable UUID moduleId,
            @PathVariable UUID semesterId
    ) {
        AssessmentWeightSummaryDto summary = weightValidationService.getWeightSummary(moduleId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(summary, "Assessment weight summary retrieved successfully"));
    }

    @PostMapping("/module/{moduleId}/semester/{semesterId}/publish")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AssessmentResponseDto>>> publishAssessmentStructure(
            @PathVariable UUID moduleId,
            @PathVariable UUID semesterId
    ) {
        List<AssessmentResponseDto> response = assessmentService.publishAssessmentStructure(moduleId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Module assessment structure published successfully"));
    }

    @PostMapping("/{id}/topics")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentTopicResponseDto>> addTopicToAssessment(
            @PathVariable UUID id,
            @Valid @RequestBody AssessmentTopicRequestDto topicDto
    ) {
        AssessmentTopicResponseDto response = assessmentService.addTopicToAssessment(id, topicDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Topic tag added to assessment successfully"));
    }

    @DeleteMapping("/{id}/topics/{topicId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeTopicFromAssessment(
            @PathVariable UUID id,
            @PathVariable UUID topicId
    ) {
        assessmentService.removeTopicFromAssessment(id, topicId);
        return ResponseEntity.ok(ApiResponse.success("Topic tag removed successfully"));
    }

    @GetMapping("/module/{moduleId}/semester/{semesterId}/diagnostic")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<TopicCoverageReportDto>> getTopicDiagnosticReport(
            @PathVariable UUID moduleId,
            @PathVariable UUID semesterId
    ) {
        TopicCoverageReportDto report = assessmentService.getTopicDiagnosticReport(moduleId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(report, "Topic diagnostic coverage report retrieved successfully"));
    }
}
