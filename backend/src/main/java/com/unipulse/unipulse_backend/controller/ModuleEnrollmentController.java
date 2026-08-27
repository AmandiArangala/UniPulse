package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.enrollment.EnrollmentStatusUpdateRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentResponseDto;
import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import com.unipulse.unipulse_backend.service.ModuleEnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class ModuleEnrollmentController {

    private final ModuleEnrollmentService moduleEnrollmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ModuleEnrollmentResponseDto>> enrollStudentInModule(
            @Valid @RequestBody ModuleEnrollmentRequestDto request
    ) {
        ModuleEnrollmentResponseDto response = moduleEnrollmentService.enrollStudentInModule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Student successfully registered for module"));
    }

    @PostMapping("/{id}/drop")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ModuleEnrollmentResponseDto>> dropModule(@PathVariable UUID id) {
        ModuleEnrollmentResponseDto response = moduleEnrollmentService.dropModule(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Module dropped successfully"));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<ModuleEnrollmentResponseDto>> withdrawFromModule(@PathVariable UUID id) {
        ModuleEnrollmentResponseDto response = moduleEnrollmentService.withdrawFromModule(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Withdrawn from module successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<ModuleEnrollmentResponseDto>> updateEnrollmentStatus(
            @PathVariable UUID id,
            @Valid @RequestBody EnrollmentStatusUpdateRequestDto request
    ) {
        ModuleEnrollmentResponseDto response = moduleEnrollmentService.updateEnrollmentStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Enrollment status updated successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER', 'STUDENT')")
    public ResponseEntity<ApiResponse<ModuleEnrollmentResponseDto>> getEnrollmentById(@PathVariable UUID id) {
        ModuleEnrollmentResponseDto response = moduleEnrollmentService.getEnrollmentById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Enrollment details retrieved successfully"));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ModuleEnrollmentResponseDto>>> getStudentEnrollments(
            @PathVariable UUID studentId,
            @RequestParam(required = false) EnrollmentStatus status
    ) {
        List<ModuleEnrollmentResponseDto> response;
        if (status != null) {
            response = moduleEnrollmentService.getStudentEnrollmentsByStatus(studentId, status);
        } else {
            response = moduleEnrollmentService.getStudentEnrollments(studentId);
        }
        return ResponseEntity.ok(ApiResponse.success(response, "Student enrollments retrieved successfully"));
    }

    @GetMapping("/student/{studentId}/semester/{semesterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ModuleEnrollmentResponseDto>>> getStudentSemesterEnrollments(
            @PathVariable UUID studentId,
            @PathVariable UUID semesterId
    ) {
        List<ModuleEnrollmentResponseDto> response = moduleEnrollmentService.getStudentSemesterEnrollments(studentId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student semester enrollments retrieved successfully"));
    }

    @GetMapping("/module/{moduleId}/semester/{semesterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVISOR', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<ModuleEnrollmentResponseDto>>> getModuleEnrollments(
            @PathVariable UUID moduleId,
            @PathVariable UUID semesterId
    ) {
        List<ModuleEnrollmentResponseDto> response = moduleEnrollmentService.getModuleEnrollments(moduleId, semesterId);
        return ResponseEntity.ok(ApiResponse.success(response, "Module semester roster retrieved successfully"));
    }
}
