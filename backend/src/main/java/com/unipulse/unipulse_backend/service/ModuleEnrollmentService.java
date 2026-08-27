package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.enrollment.EnrollmentStatusUpdateRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentResponseDto;

import java.util.List;
import java.util.UUID;

public interface ModuleEnrollmentService {

    ModuleEnrollmentResponseDto enrollStudentInModule(ModuleEnrollmentRequestDto request);

    ModuleEnrollmentResponseDto dropModule(UUID enrollmentId);

    ModuleEnrollmentResponseDto withdrawFromModule(UUID enrollmentId);

    ModuleEnrollmentResponseDto updateEnrollmentStatus(UUID enrollmentId, EnrollmentStatusUpdateRequestDto request);

    ModuleEnrollmentResponseDto getEnrollmentById(UUID enrollmentId);

    List<ModuleEnrollmentResponseDto> getStudentEnrollments(UUID studentId);

    List<ModuleEnrollmentResponseDto> getStudentSemesterEnrollments(UUID studentId, UUID semesterId);

    List<ModuleEnrollmentResponseDto> getModuleEnrollments(UUID moduleId, UUID semesterId);
}
