package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentAnalyticsDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleGradeSummaryDto;
import com.unipulse.unipulse_backend.dto.student.StudentGpaSummaryDto;
import com.unipulse.unipulse_backend.dto.student.TargetGpaProjectionDto;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import com.unipulse.unipulse_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GpaCalculationServiceImplTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private AssessmentResultRepository assessmentResultRepository;
    @Mock
    private AssessmentRepository assessmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private SemesterRepository semesterRepository;
    @Mock
    private ModuleRepository moduleRepository;

    @InjectMocks
    private GpaCalculationServiceImpl gpaCalculationService;

    private UUID studentId;
    private UUID moduleId;
    private UUID semesterId;
    private UUID assessmentId;
    private Student student;
    private Module module;
    private Semester semester;
    private Enrollment enrollment;
    private Assessment caAssessment;
    private Assessment weAssessment;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        semesterId = UUID.randomUUID();
        assessmentId = UUID.randomUUID();

        User user = User.builder().firstName("John").lastName("Doe").build();
        Program program = Program.builder().name("Software Engineering").build();
        student = Student.builder()
                .userId(studentId)
                .studentNumber("IT21001234")
                .user(user)
                .program(program)
                .currentSemester(3)
                .gpa(new BigDecimal("3.80"))
                .build();

        module = Module.builder()
                .id(moduleId)
                .code("IN 2100")
                .title("Object Oriented Programming")
                .creditHours(3)
                .build();

        semester = Semester.builder()
                .id(semesterId)
                .name("Semester 1 - 2026")
                .academicYear(2026)
                .build();

        enrollment = Enrollment.builder()
                .id(UUID.randomUUID())
                .student(student)
                .module(module)
                .semester(semester)
                .build();

        caAssessment = Assessment.builder()
                .id(assessmentId)
                .title("Assignment 1")
                .type(AssessmentType.ASSIGNMENT)
                .weightPercentage(new BigDecimal("30.00"))
                .maxScore(new BigDecimal("100.00"))
                .module(module)
                .semester(semester)
                .build();

        weAssessment = Assessment.builder()
                .id(UUID.randomUUID())
                .title("Final Exam")
                .type(AssessmentType.FINAL)
                .weightPercentage(new BigDecimal("70.00"))
                .maxScore(new BigDecimal("100.00"))
                .module(module)
                .semester(semester)
                .build();
    }

    @Test
    @DisplayName("Should correctly aggregate weighted score and assign grade A+")
    void shouldCalculateModuleGradeSuccessfully() {
        AssessmentResult caResult = AssessmentResult.builder()
                .assessment(caAssessment)
                .student(student)
                .scoreObtained(new BigDecimal("90.00"))
                .build();

        AssessmentResult weResult = AssessmentResult.builder()
                .assessment(weAssessment)
                .student(student)
                .scoreObtained(new BigDecimal("88.00"))
                .build();

        when(enrollmentRepository.findByStudentUserIdAndModuleIdAndSemesterId(studentId, moduleId, semesterId))
                .thenReturn(Optional.of(enrollment));
        when(assessmentResultRepository.findByStudentUserIdAndAssessmentModuleIdAndAssessmentSemesterId(studentId, moduleId, semesterId))
                .thenReturn(List.of(caResult, weResult));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        ModuleGradeSummaryDto summary = gpaCalculationService.calculateAndPersistModuleGrade(studentId, moduleId, semesterId);

        assertNotNull(summary);
        assertEquals("A+", summary.getLetterGrade());
        assertEquals(new BigDecimal("4.00"), summary.getGradePoint());
        assertTrue(summary.getMeetsComponentThreshold());
        assertEquals(new BigDecimal("88.60"), summary.getFinalGrade());
    }

    @Test
    @DisplayName("Should enforce 35% component threshold failure when WE score is below 35%")
    void shouldFailWhenComponentThresholdNotMet() {
        AssessmentResult caResult = AssessmentResult.builder()
                .assessment(caAssessment)
                .student(student)
                .scoreObtained(new BigDecimal("90.00"))
                .build();

        // Written Exam score = 20.00 (below 35.00 threshold)
        AssessmentResult weResult = AssessmentResult.builder()
                .assessment(weAssessment)
                .student(student)
                .scoreObtained(new BigDecimal("20.00"))
                .build();

        when(enrollmentRepository.findByStudentUserIdAndModuleIdAndSemesterId(studentId, moduleId, semesterId))
                .thenReturn(Optional.of(enrollment));
        when(assessmentResultRepository.findByStudentUserIdAndAssessmentModuleIdAndAssessmentSemesterId(studentId, moduleId, semesterId))
                .thenReturn(List.of(caResult, weResult));
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        ModuleGradeSummaryDto summary = gpaCalculationService.calculateAndPersistModuleGrade(studentId, moduleId, semesterId);

        assertNotNull(summary);
        assertEquals("F", summary.getLetterGrade());
        assertEquals(new BigDecimal("0.00"), summary.getGradePoint());
        assertFalse(summary.getMeetsComponentThreshold());
    }

    @Test
    @DisplayName("Should calculate degree honors class trajectory projection")
    void shouldComputeDegreeClassTrajectory() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findDistinctSemesterIdsByStudentId(studentId)).thenReturn(List.of(semesterId));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(enrollmentRepository.findByStudentUserIdAndSemesterId(studentId, semesterId)).thenReturn(List.of(enrollment));
        when(enrollmentRepository.findByStudentUserIdAndModuleIdAndSemesterId(studentId, moduleId, semesterId)).thenReturn(Optional.of(enrollment));
        when(assessmentResultRepository.findByStudentUserIdAndAssessmentModuleIdAndAssessmentSemesterId(studentId, moduleId, semesterId)).thenReturn(Collections.emptyList());

        TargetGpaProjectionDto projection = gpaCalculationService.computeDegreeClassTrajectory(studentId);

        assertNotNull(projection);
        assertEquals(studentId, projection.getStudentId());
        assertNotNull(projection.getTargets());
        assertFalse(projection.getTargets().isEmpty());
    }

    @Test
    @DisplayName("Should calculate assessment statistical analytics")
    void shouldComputeAssessmentAnalytics() {
        AssessmentResult r1 = AssessmentResult.builder().assessment(caAssessment).scoreObtained(new BigDecimal("80.00")).build();
        AssessmentResult r2 = AssessmentResult.builder().assessment(caAssessment).scoreObtained(new BigDecimal("90.00")).build();

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(caAssessment));
        when(assessmentResultRepository.findGradedResultsByAssessmentId(assessmentId)).thenReturn(List.of(r1, r2));

        AssessmentAnalyticsDto analytics = gpaCalculationService.computeAssessmentAnalytics(assessmentId);

        assertNotNull(analytics);
        assertEquals(2, analytics.getTotalSubmissions());
        assertEquals(new BigDecimal("85.00"), analytics.getMeanScore());
        assertEquals(new BigDecimal("90.00"), analytics.getHighestScore());
        assertEquals(new BigDecimal("80.00"), analytics.getLowestScore());
    }
}
