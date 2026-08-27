package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentRequestDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleEnrollmentResponseDto;
import com.unipulse.unipulse_backend.exception.CreditCapExceededException;
import com.unipulse.unipulse_backend.exception.DuplicateEnrollmentException;
import com.unipulse.unipulse_backend.exception.InvalidEnrollmentStatusException;
import com.unipulse.unipulse_backend.exception.PrerequisiteNotMetException;
import com.unipulse.unipulse_backend.model.entity.Enrollment;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.ModulePrerequisite;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import com.unipulse.unipulse_backend.repository.EnrollmentRepository;
import com.unipulse.unipulse_backend.repository.ModulePrerequisiteRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.repository.StudentRepository;
import com.unipulse.unipulse_backend.service.impl.ModuleEnrollmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModuleEnrollmentServiceImplTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private ModulePrerequisiteRepository modulePrerequisiteRepository;

    @InjectMocks
    private ModuleEnrollmentServiceImpl moduleEnrollmentService;

    private UUID studentId;
    private UUID moduleId;
    private UUID semesterId;
    private UUID enrollmentId;
    private Student student;
    private Module module;
    private Semester semester;
    private Enrollment enrollment;
    private ModuleEnrollmentRequestDto requestDto;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        semesterId = UUID.randomUUID();
        enrollmentId = UUID.randomUUID();

        student = Student.builder()
                .userId(studentId)
                .studentNumber("STU-2026-001")
                .build();

        module = Module.builder()
                .id(moduleId)
                .code("CS101")
                .title("Programming Fundamentals")
                .creditHours(3)
                .build();

        semester = Semester.builder()
                .id(semesterId)
                .name("Fall 2026")
                .academicYear(2026)
                .build();

        enrollment = Enrollment.builder()
                .id(enrollmentId)
                .student(student)
                .module(module)
                .semester(semester)
                .status(EnrollmentStatus.ENROLLED)
                .build();

        requestDto = ModuleEnrollmentRequestDto.builder()
                .studentId(studentId)
                .moduleId(moduleId)
                .semesterId(semesterId)
                .build();
    }

    @Test
    @DisplayName("Should successfully enroll student in module when validations pass")
    void enrollStudentInModule_Success() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        when(enrollmentRepository.existsByStudentUserIdAndModuleIdAndSemesterIdAndStatusIn(
                eq(studentId), eq(moduleId), eq(semesterId), anyList()))
                .thenReturn(false);

        when(modulePrerequisiteRepository.findByModuleId(moduleId)).thenReturn(Collections.emptyList());

        when(enrollmentRepository.sumCreditHoursByStudentAndSemesterAndStatusIn(
                eq(studentId), eq(semesterId), anyList()))
                .thenReturn(15);

        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(enrollment);

        ModuleEnrollmentResponseDto response = moduleEnrollmentService.enrollStudentInModule(requestDto);

        assertThat(response).isNotNull();
        assertThat(response.getModuleCode()).isEqualTo("CS101");
        assertThat(response.getStatus()).isEqualTo(EnrollmentStatus.ENROLLED);
        verify(enrollmentRepository, times(1)).save(any(Enrollment.class));
    }

    @Test
    @DisplayName("Should throw DuplicateEnrollmentException when student is already registered")
    void enrollStudentInModule_DuplicateRegistration_ThrowsException() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        when(enrollmentRepository.existsByStudentUserIdAndModuleIdAndSemesterIdAndStatusIn(
                eq(studentId), eq(moduleId), eq(semesterId), anyList()))
                .thenReturn(true);

        assertThatThrownBy(() -> moduleEnrollmentService.enrollStudentInModule(requestDto))
                .isInstanceOf(DuplicateEnrollmentException.class)
                .hasMessageContaining("already registered");

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw PrerequisiteNotMetException when mandatory prerequisite is incomplete")
    void enrollStudentInModule_MissingPrerequisite_ThrowsException() {
        UUID prereqModuleId = UUID.randomUUID();
        Module prereqModule = Module.builder().id(prereqModuleId).code("MATH101").title("Calculus I").build();

        ModulePrerequisite prereq = ModulePrerequisite.builder()
                .module(module)
                .prerequisiteModule(prereqModule)
                .isMandatory(true)
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        when(enrollmentRepository.existsByStudentUserIdAndModuleIdAndSemesterIdAndStatusIn(
                eq(studentId), eq(moduleId), eq(semesterId), anyList()))
                .thenReturn(false);

        when(modulePrerequisiteRepository.findByModuleId(moduleId)).thenReturn(List.of(prereq));
        when(enrollmentRepository.hasStudentCompletedModule(studentId, prereqModuleId)).thenReturn(false);

        assertThatThrownBy(() -> moduleEnrollmentService.enrollStudentInModule(requestDto))
                .isInstanceOf(PrerequisiteNotMetException.class)
                .hasMessageContaining("MATH101");

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw CreditCapExceededException when semester credits exceeds 21")
    void enrollStudentInModule_CreditCapExceeded_ThrowsException() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        when(enrollmentRepository.existsByStudentUserIdAndModuleIdAndSemesterIdAndStatusIn(
                eq(studentId), eq(moduleId), eq(semesterId), anyList()))
                .thenReturn(false);

        when(modulePrerequisiteRepository.findByModuleId(moduleId)).thenReturn(Collections.emptyList());

        when(enrollmentRepository.sumCreditHoursByStudentAndSemesterAndStatusIn(
                eq(studentId), eq(semesterId), anyList()))
                .thenReturn(19); // 19 + 3 = 22 > 21

        assertThatThrownBy(() -> moduleEnrollmentService.enrollStudentInModule(requestDto))
                .isInstanceOf(CreditCapExceededException.class)
                .hasMessageContaining("maximum limit of 21 credits");

        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should drop module successfully")
    void dropModule_Success() {
        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(enrollment);

        ModuleEnrollmentResponseDto response = moduleEnrollmentService.dropModule(enrollmentId);

        assertThat(response).isNotNull();
        verify(enrollmentRepository, times(1)).save(any(Enrollment.class));
    }

    @Test
    @DisplayName("Should throw InvalidEnrollmentStatusException when trying to drop completed module")
    void dropModule_CompletedState_ThrowsException() {
        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));

        assertThatThrownBy(() -> moduleEnrollmentService.dropModule(enrollmentId))
                .isInstanceOf(InvalidEnrollmentStatusException.class)
                .hasMessageContaining("already been marked COMPLETED");

        verify(enrollmentRepository, never()).save(any());
    }
}
