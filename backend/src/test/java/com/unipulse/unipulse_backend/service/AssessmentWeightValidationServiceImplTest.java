package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentWeightSummaryDto;
import com.unipulse.unipulse_backend.exception.InvalidAssessmentWeightException;
import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.entity.Semester;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.repository.SemesterRepository;
import com.unipulse.unipulse_backend.service.impl.AssessmentWeightValidationServiceImpl;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentWeightValidationServiceImplTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private AssessmentWeightValidationServiceImpl weightValidationService;

    private UUID moduleId;
    private UUID semesterId;
    private Module module;
    private Semester semester;

    @BeforeEach
    void setUp() {
        moduleId = UUID.randomUUID();
        semesterId = UUID.randomUUID();

        module = Module.builder()
                .id(moduleId)
                .code("CS101")
                .title("Object-Oriented Programming")
                .build();

        semester = Semester.builder()
                .id(semesterId)
                .name("Fall 2026")
                .build();
    }

    @Test
    @DisplayName("Should pass weight cap validation when total weight is within 100%")
    void validateWeightCap_Success() {
        when(assessmentRepository.sumWeightByModuleIdAndSemesterId(moduleId, semesterId))
                .thenReturn(new BigDecimal("70.00"));

        weightValidationService.validateWeightCap(moduleId, semesterId, new BigDecimal("30.00"), null);

        verify(assessmentRepository, times(1)).sumWeightByModuleIdAndSemesterId(moduleId, semesterId);
    }

    @Test
    @DisplayName("Should throw InvalidAssessmentWeightException when new weight causes total to exceed 100%")
    void validateWeightCap_ExceedsHundred_ThrowsException() {
        when(assessmentRepository.sumWeightByModuleIdAndSemesterId(moduleId, semesterId))
                .thenReturn(new BigDecimal("80.00"));

        assertThatThrownBy(() -> weightValidationService.validateWeightCap(moduleId, semesterId, new BigDecimal("30.00"), null))
                .isInstanceOf(InvalidAssessmentWeightException.class)
                .hasMessageContaining("exceeds the 100.00% total module cap");
    }

    @Test
    @DisplayName("Should throw InvalidAssessmentWeightException when new weight is zero or negative")
    void validateWeightCap_ZeroWeight_ThrowsException() {
        assertThatThrownBy(() -> weightValidationService.validateWeightCap(moduleId, semesterId, BigDecimal.ZERO, null))
                .isInstanceOf(InvalidAssessmentWeightException.class)
                .hasMessageContaining("must be greater than 0.00%");
    }

    @Test
    @DisplayName("Should correctly generate weight summary and report balanced status when total is 100%")
    void getWeightSummary_Balanced_Success() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(semesterRepository.findById(semesterId)).thenReturn(Optional.of(semester));

        Assessment a1 = Assessment.builder()
                .id(UUID.randomUUID())
                .module(module)
                .semester(semester)
                .title("Midterm Exam")
                .type(AssessmentType.MIDTERM)
                .weightPercentage(new BigDecimal("40.00"))
                .maxScore(new BigDecimal("100.00"))
                .isPublished(false)
                .build();

        Assessment a2 = Assessment.builder()
                .id(UUID.randomUUID())
                .module(module)
                .semester(semester)
                .title("Final Exam")
                .type(AssessmentType.FINAL)
                .weightPercentage(new BigDecimal("60.00"))
                .maxScore(new BigDecimal("100.00"))
                .isPublished(false)
                .build();

        when(assessmentRepository.findByModuleIdAndSemesterId(moduleId, semesterId))
                .thenReturn(List.of(a1, a2));

        AssessmentWeightSummaryDto summary = weightValidationService.getWeightSummary(moduleId, semesterId);

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalWeightPercentage()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(summary.getRemainingWeightPercentage()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(summary.getIsBalanced()).isTrue();
        assertThat(summary.getIsOverAllocated()).isFalse();
        assertThat(summary.getTotalAssessmentsCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should verify full balance for publishing successfully when total is exactly 100%")
    void verifyFullBalanceForPublishing_ExactlyHundred_Success() {
        when(assessmentRepository.sumWeightByModuleIdAndSemesterId(moduleId, semesterId))
                .thenReturn(new BigDecimal("100.00"));

        weightValidationService.verifyFullBalanceForPublishing(moduleId, semesterId);

        verify(assessmentRepository, times(1)).sumWeightByModuleIdAndSemesterId(moduleId, semesterId);
    }

    @Test
    @DisplayName("Should throw InvalidAssessmentWeightException when verifying publish balance for total < 100%")
    void verifyFullBalanceForPublishing_LessThanHundred_ThrowsException() {
        when(assessmentRepository.sumWeightByModuleIdAndSemesterId(moduleId, semesterId))
                .thenReturn(new BigDecimal("85.00"));

        assertThatThrownBy(() -> weightValidationService.verifyFullBalanceForPublishing(moduleId, semesterId))
                .isInstanceOf(InvalidAssessmentWeightException.class)
                .hasMessageContaining("must equal exactly 100.00%");
    }
}
