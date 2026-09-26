package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.student.*;
import com.unipulse.unipulse_backend.service.AcademicTwinService;
import com.unipulse.unipulse_backend.service.GradeSimulatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic-twin")
@RequiredArgsConstructor
public class AcademicTwinController {

    private final AcademicTwinService academicTwinService;
    private final GradeSimulatorService gradeSimulatorService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AcademicTwinDto>> getAcademicTwin(@PathVariable UUID studentId) {
        AcademicTwinDto twin = academicTwinService.getAcademicTwinForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(twin, "Academic Progress Twin metrics retrieved successfully"));
    }

    @GetMapping("/student/{studentId}/simulate")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AcademicTwinDto>> simulateAcademicTwin(
            @PathVariable UUID studentId,
            @RequestParam(required = false) BigDecimal attn,
            @RequestParam(required = false) BigDecimal subm,
            @RequestParam(required = false) BigDecimal engage,
            @RequestParam(required = false) BigDecimal perf
    ) {
        AcademicTwinDto twin = academicTwinService.calculateCustomAcademicTwin(studentId, attn, subm, engage, perf);
        return ResponseEntity.ok(ApiResponse.success(twin, "Academic Progress Twin simulation calculated successfully"));
    }

    @PostMapping("/grade-simulator/calculate")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<GradeSimulatorResultDto>> calculateGradeSimulator(
            @Valid @RequestBody GradeSimulatorRequestDto request
    ) {
        GradeSimulatorResultDto result = gradeSimulatorService.calculateRequiredMark(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Grade simulator calculation generated successfully"));
    }

    @PostMapping("/grade-simulator/scenario-matrix")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<DynamicScenarioMatrixDto>> generateScenarioMatrix(
            @Valid @RequestBody GradeSimulatorRequestDto request
    ) {
        DynamicScenarioMatrixDto matrix = gradeSimulatorService.generateScenarioMatrix(request);
        return ResponseEntity.ok(ApiResponse.success(matrix, "Dynamic exam scenario matrix generated successfully"));
    }

    @PostMapping("/gpa-planner/calculate")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<TargetGpaGoalResultDto>> calculateTargetGpaGoal(
            @Valid @RequestBody TargetGpaGoalRequestDto request
    ) {
        TargetGpaGoalResultDto plan = gradeSimulatorService.calculateGpaGoalPlan(request);
        return ResponseEntity.ok(ApiResponse.success(plan, "Target GPA goal plan calculated successfully"));
    }
}
