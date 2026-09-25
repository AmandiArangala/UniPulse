package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.AcademicTwinDto;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Program;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.entity.User;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AcademicTwinServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private GpaCalculationService gpaCalculationService;

    @InjectMocks
    private AcademicTwinServiceImpl academicTwinService;

    private UUID studentId;
    private Student student;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();

        User user = User.builder()
                .id(studentId)
                .firstName("Alex")
                .lastName("Mercer")
                .email("alex.mercer@unipulse.edu")
                .build();

        Program program = Program.builder()
                .id(UUID.randomUUID())
                .name("BSc Computer Science & Data Analytics")
                .totalCredits(120)
                .build();

        student = Student.builder()
                .userId(studentId)
                .user(user)
                .studentNumber("STU-2026-8941")
                .program(program)
                .currentSemester(4)
                .gpa(new BigDecimal("3.42"))
                .build();
    }

    @Test
    @DisplayName("Should correctly calculate default Academic Health Score and progress twin metrics")
    void getAcademicTwinForStudent_Success() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        AcademicTwinDto result = academicTwinService.getAcademicTwinForStudent(studentId);

        assertThat(result).isNotNull();
        assertThat(result.getStudentId()).isEqualTo(studentId);
        assertThat(result.getStudentName()).isEqualTo("Alex Mercer");
        assertThat(result.getCurrentCgpa()).isEqualTo(new BigDecimal("3.42"));
        assertThat(result.getHealthScore()).isNotNull();
        assertThat(result.getStatusTier()).isNotNull();
        assertThat(result.getHealthBreakdown()).isNotNull();
        assertThat(result.getHealthBreakdown().getFormulaDescription())
                .contains("Health = (Perf*0.40) + (Attn*0.20) + (Subm*0.15) + (Engage*0.15) + (Trend*0.10)");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when student ID does not exist")
    void getAcademicTwinForStudent_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(studentRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> academicTwinService.getAcademicTwinForStudent(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Student not found");
    }

    @Test
    @DisplayName("Should calculate custom Academic Progress Twin metrics under simulated conditions")
    void calculateCustomAcademicTwin_Success() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        BigDecimal customAttn = new BigDecimal("95.00");
        BigDecimal customSubm = new BigDecimal("98.00");
        BigDecimal customEngage = new BigDecimal("90.00");
        BigDecimal customPerf = new BigDecimal("88.00");

        AcademicTwinDto result = academicTwinService.calculateCustomAcademicTwin(
                studentId, customAttn, customSubm, customEngage, customPerf
        );

        assertThat(result).isNotNull();
        assertThat(result.getAttendanceRate()).isEqualTo(customAttn);
        assertThat(result.getSubmissionRate()).isEqualTo(customSubm);
        assertThat(result.getEngagementScore()).isEqualTo(customEngage);
        assertThat(result.getAssessmentAvg()).isEqualTo(customPerf);
        assertThat(result.getStatusTier()).isEqualTo("EXCELLENT");
    }
}
