package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.assessment.*;
import com.unipulse.unipulse_backend.exception.DuplicateResourceException;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.entity.AssessmentTopic;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.AssessmentTopicRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.service.impl.AssessmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceImplTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentTopicRepository assessmentTopicRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private AssessmentWeightValidationService weightValidationService;

    @InjectMocks
    private AssessmentServiceImpl assessmentService;

    private UUID moduleId;
    private UUID semesterId;
    private UUID assessmentId;
    private Module module;
    private Semester semester;
    private Assessment assessment;
    private AssessmentRequestDto requestDto;

    @BeforeEach
    void setUp() {
        moduleId = UUID.randomUUID();
        semesterId = UUID.randomUUID();
        assessmentId = UUID.randomUUID();

        module = Module.builder()
                .id(moduleId)
                .code("CS101")
                .title("Object-Oriented Programming")
                .build();

        semester = Semester.builder()
                .id(semesterId)
                .name("Fall 2026")
                .build();

        assessment = Assessment.builder()
                .id(assessmentId)
                .module(module)
                .semester(semester)
                .title("Midterm Exam")
                .type(AssessmentType.MIDTERM)
                .weightPercentage(new BigDecimal("30.00"))
                .maxScore(new BigDecimal("100.00"))
                .isPublished(false)
                .topics(new ArrayList<>())
                .build();

        requestDto = AssessmentRequestDto.builder()
                .moduleId(moduleId)
                .semesterId(semesterId)
                .title("Midterm Exam")
                .type(AssessmentType.MIDTERM)
                .weightPercentage(new BigDecimal("30.00"))
                .maxScore(new BigDecimal("100.00"))
                .build();
    }

    @Test
    @DisplayName("Should create assessment successfully when request data is valid and within weight cap")
    void createAssessment_Success() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(assessmentRepository.existsByModuleIdAndSemesterIdAndTitle(moduleId, semesterId, "Midterm Exam")).thenReturn(false);
        doNothing().when(weightValidationService).validateWeightCap(moduleId, semesterId, new BigDecimal("30.00"), null);
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(assessment);

        AssessmentResponseDto response = assessmentService.createAssessment(requestDto);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Midterm Exam");
        assertThat(response.getWeightPercentage()).isEqualByComparingTo(new BigDecimal("30.00"));
        verify(weightValidationService, times(1)).validateWeightCap(moduleId, semesterId, new BigDecimal("30.00"), null);
        verify(assessmentRepository, times(1)).save(any(Assessment.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when assessment title already exists for module and semester")
    void createAssessment_DuplicateTitle_ThrowsException() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));
        when(assessmentRepository.existsByModuleIdAndSemesterIdAndTitle(moduleId, semesterId, "Midterm Exam")).thenReturn(true);

        assertThatThrownBy(() -> assessmentService.createAssessment(requestDto))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(assessmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get assessment by ID successfully")
    void getAssessmentById_Success() {
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));

        AssessmentResponseDto response = assessmentService.getAssessmentById(assessmentId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(assessmentId);
        assertThat(response.getTitle()).isEqualTo("Midterm Exam");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when assessment ID is not found")
    void getAssessmentById_NotFound_ThrowsException() {
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> assessmentService.getAssessmentById(assessmentId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should add topic tag to assessment successfully")
    void addTopicToAssessment_Success() {
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));

        AssessmentTopic topic = AssessmentTopic.builder()
                .id(UUID.randomUUID())
                .assessment(assessment)
                .topicName("Polymorphism")
                .weightContribution(new BigDecimal("10.00"))
                .description("OO inheritance and virtual methods")
                .build();

        when(assessmentTopicRepository.save(any(AssessmentTopic.class))).thenReturn(topic);

        AssessmentTopicRequestDto topicRequest = AssessmentTopicRequestDto.builder()
                .topicName("Polymorphism")
                .weightContribution(new BigDecimal("10.00"))
                .description("OO inheritance and virtual methods")
                .build();

        AssessmentTopicResponseDto response = assessmentService.addTopicToAssessment(assessmentId, topicRequest);

        assertThat(response).isNotNull();
        assertThat(response.getTopicName()).isEqualTo("Polymorphism");
        verify(assessmentTopicRepository, times(1)).save(any(AssessmentTopic.class));
    }

    @Test
    @DisplayName("Should publish assessment structure when 100% weight check passes")
    void publishAssessmentStructure_Success() {
        doNothing().when(weightValidationService).verifyFullBalanceForPublishing(moduleId, semesterId);
        when(assessmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId)).thenReturn(List.of(assessment));
        when(assessmentRepository.saveAll(anyList())).thenReturn(List.of(assessment));

        List<AssessmentResponseDto> publishedList = assessmentService.publishAssessmentStructure(moduleId, semesterId);

        assertThat(publishedList).isNotEmpty();
        verify(weightValidationService, times(1)).verifyFullBalanceForPublishing(moduleId, semesterId);
        verify(assessmentRepository, times(1)).saveAll(anyList());
    }
}
