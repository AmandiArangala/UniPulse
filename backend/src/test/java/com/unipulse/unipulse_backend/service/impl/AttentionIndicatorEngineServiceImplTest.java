package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.AttentionCategoryTier;
import com.unipulse.unipulse_backend.dto.student.AttentionIndicatorResultDto;
import com.unipulse.unipulse_backend.dto.student.AttentionSimulationRequestDto;
import com.unipulse.unipulse_backend.model.entity.Student;
import com.unipulse.unipulse_backend.repository.StudentRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttentionIndicatorEngineServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private AttentionIndicatorEngineServiceImpl attentionIndicatorEngineService;

    private UUID studentId;
    private Student testStudent;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        testStudent = new Student();
        testStudent.setUserId(studentId);
        testStudent.setStudentNumber("STU-10023");
        testStudent.setGpa(new BigDecimal("3.50"));
    }

    @Test
    @DisplayName("Should calculate Low Attention (Good Standing) when all metrics satisfy thresholds")
    void testLowAttentionGoodStanding() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));

        AttentionIndicatorResultDto result = attentionIndicatorEngineService.evaluateStudentAttention(studentId);

        assertNotNull(result);
        assertEquals(0, result.getTotalAttentionScore());
        assertEquals(AttentionCategoryTier.LOW_ATTENTION, result.getCategoryTier());
        assertEquals("Good Standing", result.getBadgeLabel());
        assertEquals("emerald", result.getBadgeColor());
        assertTrue(result.getSummaryDiagnostic().contains("0 triggered risk factors"));
    }

    @Test
    @DisplayName("Should trigger High Attention (Score 100) when all 5 trigger rules are violated")
    void testHighAttentionAllTriggersActive() {
        AttentionSimulationRequestDto request = AttentionSimulationRequestDto.builder()
                .studentId(studentId)
                .attendanceRate(new BigDecimal("45.00")) // < 60% -> +30
                .averageMark(new BigDecimal("40.00"))     // < 50% -> +30
                .missedTestsCount(3)                       // >= 2  -> +20
                .trendSlope("DECLINING")                   // -> +10
                .engagementScore(new BigDecimal("35.00")) // < 50% -> +10
                .build();

        AttentionIndicatorResultDto result = attentionIndicatorEngineService.evaluateCustomAttention(request);

        assertNotNull(result);
        assertEquals(100, result.getTotalAttentionScore());
        assertEquals(AttentionCategoryTier.HIGH_ATTENTION, result.getCategoryTier());
        assertEquals("Priority Support Recommended", result.getBadgeLabel());
        assertEquals("rose", result.getBadgeColor());
        assertEquals(5, result.getTriggerDetails().stream().filter(t -> t.isTriggered()).count());
        assertTrue(result.getAdvisorDiagnosticNote().contains("Urgent multi-dimensional academic support"));
    }

    @Test
    @DisplayName("Should trigger Medium Attention (Score 30) when only low attendance is triggered")
    void testMediumAttentionSingleTrigger() {
        AttentionSimulationRequestDto request = AttentionSimulationRequestDto.builder()
                .studentId(studentId)
                .attendanceRate(new BigDecimal("55.00")) // < 60% -> +30
                .averageMark(new BigDecimal("75.00"))     // >= 50%
                .missedTestsCount(0)                       // < 2
                .trendSlope("STABLE")                      // not declining
                .engagementScore(new BigDecimal("80.00")) // >= 50%
                .build();

        AttentionIndicatorResultDto result = attentionIndicatorEngineService.evaluateCustomAttention(request);

        assertNotNull(result);
        assertEquals(30, result.getTotalAttentionScore());
        assertEquals(AttentionCategoryTier.MEDIUM_ATTENTION, result.getCategoryTier());
        assertEquals("Moderate Focus Needed", result.getBadgeLabel());
        assertEquals("amber", result.getBadgeColor());
        assertEquals(1, result.getTriggerDetails().stream().filter(t -> t.isTriggered()).count());
    }
}
