package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.student.SemesterGpaReportDto;
import com.unipulse.unipulse_backend.dto.student.StudentGpaSummaryDto;
import com.unipulse.unipulse_backend.dto.student.TargetGpaProjectionDto;
import com.unipulse.unipulse_backend.dto.student.WhatIfGpaSimulationRequestDto;
import com.unipulse.unipulse_backend.dto.student.WhatIfGpaSimulationResponseDto;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gpa")
@RequiredArgsConstructor
public class GpaController {

    private final GpaCalculationService gpaCalculationService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<StudentGpaSummaryDto>> getCumulativeGpaSummary(@PathVariable UUID studentId) {
        StudentGpaSummaryDto summary = gpaCalculationService.calculateCumulativeGpa(studentId);
        return ResponseEntity.ok(ApiResponse.success(summary, "Student cumulative GPA summary retrieved successfully"));
    }

    @GetMapping("/student/{studentId}/semester/{semesterId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<SemesterGpaReportDto>> getSemesterGpaReport(
            @PathVariable UUID studentId,
            @PathVariable UUID semesterId
    ) {
        SemesterGpaReportDto report = gpaCalculationService.calculateSemesterGpa(studentId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(report, "Semester GPA report retrieved successfully"));
    }

    @GetMapping("/student/{studentId}/trajectory")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<TargetGpaProjectionDto>> getDegreeClassTrajectory(@PathVariable UUID studentId) {
        TargetGpaProjectionDto projection = gpaCalculationService.computeDegreeClassTrajectory(studentId);
        return ResponseEntity.ok(ApiResponse.success(projection, "Degree honors trajectory projection retrieved successfully"));
    }

    @PostMapping("/student/{studentId}/what-if")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<WhatIfGpaSimulationResponseDto>> simulateWhatIfGpa(
            @PathVariable UUID studentId,
            @Valid @RequestBody WhatIfGpaSimulationRequestDto request
    ) {
        WhatIfGpaSimulationResponseDto response = gpaCalculationService.simulateWhatIfGpa(studentId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "What-If GPA simulation completed successfully"));
    }
}
