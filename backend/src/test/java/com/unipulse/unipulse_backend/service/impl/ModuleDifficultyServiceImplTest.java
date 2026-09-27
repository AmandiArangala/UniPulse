package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.ModuleDifficultyIndexDto;
import com.unipulse.unipulse_backend.model.entity.Enrollment;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import com.unipulse.unipulse_backend.repository.EnrollmentRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.service.AssessmentDifficultyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModuleDifficultyServiceImplTest {

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private AssessmentDifficultyService assessmentDifficultyService;

    @InjectMocks
    private ModuleDifficultyServiceImpl moduleDifficultyService;

    private UUID moduleId;
    private Module module;

    @BeforeEach
    void setUp() {
        moduleId = UUID.randomUUID();
        module = Module.builder()
                .id(moduleId)
                .code("CS301")
                .title("Advanced Algorithms & Data Structures")
                .creditHours(4)
                .build();
    }

    @Test
    @DisplayName("Should correctly calculate Module Difficulty Index with failing and withdrawn enrollments")
    void calculateModuleDifficultyIndex_Success() {
        Student s1 = Student.builder().userId(UUID.randomUUID()).build();
        Student s2 = Student.builder().userId(UUID.randomUUID()).build();
        Student s3 = Student.builder().userId(UUID.randomUUID()).build();

        Enrollment e1 = Enrollment.builder()
                .id(UUID.randomUUID())
                .student(s1)
                .module(module)
                .finalGrade(new BigDecimal("35.00"))
                .letterGrade("F")
                .status(EnrollmentStatus.ENROLLED)
                .build();

        Enrollment e2 = Enrollment.builder()
                .id(UUID.randomUUID())
                .student(s2)
                .module(module)
                .finalGrade(new BigDecimal("78.00"))
                .letterGrade("A")
                .status(EnrollmentStatus.COMPLETED)
                .build();

        Enrollment e3 = Enrollment.builder()
                .id(UUID.randomUUID())
                .student(s3)
                .module(module)
                .status(EnrollmentStatus.WITHDRAWN)
                .build();

        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(enrollmentRepository.findByModuleId(moduleId)).thenReturn(Arrays.asList(e1, e2, e3));
        when(assessmentDifficultyService.getAssessmentsDifficultyForModule(moduleId)).thenReturn(Collections.emptyList());
        when(assessmentDifficultyService.getTopicDiagnosticsForModule(moduleId)).thenReturn(Collections.emptyList());

        ModuleDifficultyIndexDto result = moduleDifficultyService.calculateModuleDifficultyIndex(moduleId);

        assertThat(result).isNotNull();
        assertThat(result.getModuleCode()).isEqualTo("CS301");
        assertThat(result.getTotalEnrolled()).isEqualTo(3);
        assertThat(result.getFailureRate()).isEqualTo(33.33); // 1 out of 3 failed
        assertThat(result.getWithdrawalRate()).isEqualTo(33.33); // 1 out of 3 withdrawn
        assertThat(result.getDifficultyIndexScore()).isGreaterThan(0.0);
        assertThat(result.getDifficultyBand()).isNotNull();
    }
}
