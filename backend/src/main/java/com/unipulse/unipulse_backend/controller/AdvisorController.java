package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.advisor.*;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.service.AdvisorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/advisors")
@RequiredArgsConstructor
public class AdvisorController {

    private final AdvisorService advisorService;

    @GetMapping("/caseload")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AdvisorCaseloadSummaryDto>> getCaseloadSummary(
            @RequestParam(required = false) UUID advisorId
    ) {
        AdvisorCaseloadSummaryDto summary = advisorService.getCaseloadSummary(advisorId);
        return ResponseEntity.ok(ApiResponse.success(summary, "Advisor caseload summary retrieved successfully"));
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<AssignedStudentDto>>> getAssignedStudents(
            @RequestParam(required = false) UUID advisorId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String status
    ) {
        List<AssignedStudentDto> students = advisorService.getAssignedStudents(advisorId, search, departmentId, status);
        return ResponseEntity.ok(ApiResponse.success(students, "Assigned students directory retrieved successfully"));
    }

    @GetMapping("/students/{studentId}/360")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<Student360DetailDto>> getStudent360(
            @PathVariable UUID studentId
    ) {
        Student360DetailDto profile = advisorService.getStudent360(studentId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Student 360 profile retrieved successfully"));
    }

    @GetMapping("/interventions")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<AcademicInterventionDto>>> getInterventions(
            @RequestParam(required = false) UUID advisorId,
            @RequestParam(required = false) String status
    ) {
        List<AcademicInterventionDto> interventions = advisorService.getInterventions(advisorId, status);
        return ResponseEntity.ok(ApiResponse.success(interventions, "Academic interventions retrieved successfully"));
    }

    @PostMapping("/interventions")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<AcademicInterventionDto>> createIntervention(
            @RequestParam(required = false) UUID advisorId,
            @Valid @RequestBody CreateInterventionRequestDto dto
    ) {
        AcademicInterventionDto created = advisorService.createIntervention(advisorId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Academic intervention created successfully"));
    }

    @PutMapping("/interventions/{id}/status")
    @PreAuthorize("hasAnyRole('ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AcademicInterventionDto>> updateInterventionStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInterventionStatusDto dto
    ) {
        AcademicInterventionDto updated = advisorService.updateInterventionStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Intervention status updated successfully"));
    }
}
