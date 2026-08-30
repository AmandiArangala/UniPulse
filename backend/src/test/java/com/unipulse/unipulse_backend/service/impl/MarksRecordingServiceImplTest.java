package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentResultResponseDto;
import com.unipulse.unipulse_backend.dto.assessment.BatchMarkEntryRequestDto;
import com.unipulse.unipulse_backend.dto.assessment.BatchMarkImportResultDto;
import com.unipulse.unipulse_backend.dto.assessment.MarkEntryRequestDto;
import com.unipulse.unipulse_backend.exception.BadRequestException;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.AssessmentResultRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarksRecordingServiceImplTest {

    @Mock
    private AssessmentRepository assessmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private AssessmentResultRepository assessmentResultRepository;
    @Mock
    private GpaCalculationService gpaCalculationService;

    @InjectMocks
    private MarksRecordingServiceImpl marksRecordingService;

    private UUID assessmentId;
    private UUID studentId;
    private Assessment assessment;
    private Student student;
    private Module module;
    private Semester semester;

    @BeforeEach
    void setUp() {
        assessmentId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        module = Module.builder().id(UUID.randomUUID()).code("IN 2100").title("OOP").build();
        semester = Semester.builder().id(UUID.randomUUID()).name("Sem 1").build();

        assessment = Assessment.builder()
                .id(assessmentId)
                .title("Quiz 1")
                .type(AssessmentType.QUIZ)
                .maxScore(new BigDecimal("100.00"))
                .weightPercentage(new BigDecimal("15.00"))
                .module(module)
                .semester(semester)
                .build();

        User user = User.builder().firstName("Jane").lastName("Smith").build();
        student = Student.builder()
                .userId(studentId)
                .studentNumber("IT21005678")
                .user(user)
                .build();
    }

    @Test
    @DisplayName("Should successfully record single mark score and trigger GPA calculation cascade")
    void shouldRecordSingleMarkSuccessfully() {
        MarkEntryRequestDto request = MarkEntryRequestDto.builder()
                .studentId(studentId)
                .scoreObtained(new BigDecimal("85.00"))
                .isLate(false)
                .feedback("Good work")
                .build();

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(assessmentResultRepository.findByAssessmentIdAndStudentUserId(assessmentId, studentId)).thenReturn(Optional.empty());
        when(assessmentResultRepository.save(any(AssessmentResult.class))).thenAnswer(inv -> inv.getArgument(0));

        AssessmentResultResponseDto response = marksRecordingService.recordSingleMark(assessmentId, request);

        assertNotNull(response);
        assertEquals(assessmentId, response.getAssessmentId());
        assertEquals(studentId, response.getStudentId());
        assertEquals(new BigDecimal("85.00"), response.getScoreObtained());
        assertEquals("Good work", response.getFeedback());

        verify(gpaCalculationService, times(1))
                .calculateAndPersistModuleGrade(studentId, module.getId(), semester.getId());
    }

    @Test
    @DisplayName("Should throw BadRequestException when score exceeds max score")
    void shouldThrowExceptionWhenScoreExceedsMaxScore() {
        MarkEntryRequestDto request = MarkEntryRequestDto.builder()
                .studentId(studentId)
                .scoreObtained(new BigDecimal("150.00")) // Max score is 100
                .build();

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        assertThrows(BadRequestException.class, () -> marksRecordingService.recordSingleMark(assessmentId, request));
    }

    @Test
    @DisplayName("Should record batch marks with success and failure metrics")
    void shouldRecordBatchMarks() {
        MarkEntryRequestDto validEntry = MarkEntryRequestDto.builder()
                .studentId(studentId)
                .scoreObtained(new BigDecimal("75.00"))
                .build();

        MarkEntryRequestDto invalidEntry = MarkEntryRequestDto.builder()
                .studentNumber("NON_EXISTENT_STUDENT")
                .scoreObtained(new BigDecimal("50.00"))
                .build();

        BatchMarkEntryRequestDto batchRequest = BatchMarkEntryRequestDto.builder()
                .marks(List.of(validEntry, invalidEntry))
                .build();

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentRepository.findByStudentNumber("NON_EXISTENT_STUDENT")).thenReturn(Optional.empty());
        when(assessmentResultRepository.findByAssessmentIdAndStudentUserId(assessmentId, studentId)).thenReturn(Optional.empty());
        when(assessmentResultRepository.save(any(AssessmentResult.class))).thenAnswer(inv -> inv.getArgument(0));

        BatchMarkImportResultDto batchResult = marksRecordingService.recordBatchMarks(assessmentId, batchRequest);

        assertNotNull(batchResult);
        assertEquals(2, batchResult.getTotalProcessed());
        assertEquals(1, batchResult.getSuccessCount());
        assertEquals(1, batchResult.getFailureCount());
        assertEquals(1, batchResult.getErrors().size());
    }
}
