package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GradeSimulatorServiceImplTest {

    private GradeSimulatorServiceImpl gradeSimulatorService;

    @BeforeEach
    void setUp() {
        gradeSimulatorService = new GradeSimulatorServiceImpl();
    }

    @Test
    @DisplayName("Should correctly calculate required mark on remaining final exam to hit 70% B+ target")
    void calculateRequiredMark_StandardAchievableCase() {
        // Quiz 10% @ 85, Assignment 15% @ 72, Midterm 25% @ 64, Final 50% pending
        AssessmentScoreInput a1 = AssessmentScoreInput.builder().title("Quiz 1").weight(new BigDecimal("10.00")).score(new BigDecimal("85.00")).isCompleted(true).build();
        AssessmentScoreInput a2 = AssessmentScoreInput.builder().title("Assignment 1").weight(new BigDecimal("15.00")).score(new BigDecimal("72.00")).isCompleted(true).build();
        AssessmentScoreInput a3 = AssessmentScoreInput.builder().title("Midterm").weight(new BigDecimal("25.00")).score(new BigDecimal("64.00")).isCompleted(true).build();
        AssessmentScoreInput a4 = AssessmentScoreInput.builder().title("Final Exam").weight(new BigDecimal("50.00")).score(BigDecimal.ZERO).isCompleted(false).build();

        GradeSimulatorRequestDto request = GradeSimulatorRequestDto.builder()
                .moduleCode("CS301")
                .moduleTitle("Database Systems")
                .targetTotalMark(new BigDecimal("70.00"))
                .targetGradeLetter("B+")
                .assessments(List.of(a1, a2, a3, a4))
                .build();

        GradeSimulatorResultDto result = gradeSimulatorService.calculateRequiredMark(request);

        assertThat(result).isNotNull();
        assertThat(result.getModuleCode()).isEqualTo("CS301");
        assertThat(result.getCompletedWeight()).isEqualTo(new BigDecimal("50.00"));
        assertThat(result.getRemainingWeight()).isEqualTo(new BigDecimal("50.00"));
        // Current weighted total = (85*0.10) + (72*0.15) + (64*0.25) = 8.5 + 10.8 + 16.0 = 35.30
        assertThat(result.getCurrentWeightedTotal()).isEqualTo(new BigDecimal("35.30"));
        // Required mark = (70.00 - 35.30) / 0.50 = 69.40
        assertThat(result.getRequiredMarkOnRemaining()).isEqualTo(new BigDecimal("69.40"));
        assertThat(result.getIsAchievable()).isTrue();
        assertThat(result.getStatusMessage()).contains("Requires an average of 69.40%");
    }

    @Test
    @DisplayName("Should return 0.00 required mark when target mark is already secured")
    void calculateRequiredMark_TargetAlreadySecured() {
        AssessmentScoreInput a1 = AssessmentScoreInput.builder().title("Quiz 1").weight(new BigDecimal("20.00")).score(new BigDecimal("90.00")).isCompleted(true).build();
        AssessmentScoreInput a2 = AssessmentScoreInput.builder().title("Assignment 1").weight(new BigDecimal("30.00")).score(new BigDecimal("95.00")).isCompleted(true).build();
        AssessmentScoreInput a3 = AssessmentScoreInput.builder().title("Midterm").weight(new BigDecimal("30.00")).score(new BigDecimal("90.00")).isCompleted(true).build();
        AssessmentScoreInput a4 = AssessmentScoreInput.builder().title("Final Exam").weight(new BigDecimal("20.00")).score(BigDecimal.ZERO).isCompleted(false).build();

        // Current weighted = 18 + 28.5 + 27 = 73.50%. Target = 60.00%
        GradeSimulatorRequestDto request = GradeSimulatorRequestDto.builder()
                .moduleCode("CS302")
                .targetTotalMark(new BigDecimal("60.00"))
                .targetGradeLetter("B")
                .assessments(List.of(a1, a2, a3, a4))
                .build();

        GradeSimulatorResultDto result = gradeSimulatorService.calculateRequiredMark(request);

        assertThat(result.getCurrentWeightedTotal()).isEqualTo(new BigDecimal("73.50"));
        assertThat(result.getRequiredMarkOnRemaining()).isEqualTo(new BigDecimal("0.00"));
        assertThat(result.getIsAchievable()).isTrue();
        assertThat(result.getStatusMessage()).contains("secured!");
    }

    @Test
    @DisplayName("Should mark simulation as unachievable when required score exceeds 100%")
    void calculateRequiredMark_UnachievableTarget() {
        AssessmentScoreInput a1 = AssessmentScoreInput.builder().title("Quiz 1").weight(new BigDecimal("20.00")).score(new BigDecimal("50.00")).isCompleted(true).build();
        AssessmentScoreInput a2 = AssessmentScoreInput.builder().title("Midterm").weight(new BigDecimal("30.00")).score(new BigDecimal("60.00")).isCompleted(true).build();
        AssessmentScoreInput a3 = AssessmentScoreInput.builder().title("Final Exam").weight(new BigDecimal("50.00")).score(BigDecimal.ZERO).isCompleted(false).build();

        // Current weighted = 10 + 18 = 28.00%. Target = 95.00%. Gap = 67.00. Required = 67 / 0.5 = 134.00%
        GradeSimulatorRequestDto request = GradeSimulatorRequestDto.builder()
                .moduleCode("CS303")
                .targetTotalMark(new BigDecimal("95.00"))
                .targetGradeLetter("A+")
                .assessments(List.of(a1, a2, a3))
                .build();

        GradeSimulatorResultDto result = gradeSimulatorService.calculateRequiredMark(request);

        assertThat(result.getRequiredMarkOnRemaining()).isEqualTo(new BigDecimal("134.00"));
        assertThat(result.getIsAchievable()).isFalse();
        assertThat(result.getStatusMessage()).contains("Unachievable target");
    }

    @Test
    @DisplayName("Should generate dynamic scenario matrix across range of exam scores with statistical bounds")
    void generateScenarioMatrix_Success() {
        AssessmentScoreInput a1 = AssessmentScoreInput.builder().title("Coursework").weight(new BigDecimal("40.00")).score(new BigDecimal("70.00")).isCompleted(true).build();
        AssessmentScoreInput a2 = AssessmentScoreInput.builder().title("Final Exam").weight(new BigDecimal("60.00")).score(BigDecimal.ZERO).isCompleted(false).build();

        GradeSimulatorRequestDto request = GradeSimulatorRequestDto.builder()
                .moduleCode("CS304")
                .targetTotalMark(new BigDecimal("75.00"))
                .assessments(List.of(a1, a2))
                .build();

        DynamicScenarioMatrixDto matrix = gradeSimulatorService.generateScenarioMatrix(request);

        assertThat(matrix).isNotNull();
        assertThat(matrix.getModuleCode()).isEqualTo("CS304");
        assertThat(matrix.getWorstPossibleMark()).isEqualTo(new BigDecimal("28.00"));
        assertThat(matrix.getBestPossibleMark()).isEqualTo(new BigDecimal("88.00"));
        assertThat(matrix.getMinimumScoreToPass()).isEqualTo(new BigDecimal("28.33"));
        assertThat(matrix.getMinimumScoreForTarget()).isEqualTo(new BigDecimal("78.33"));
        assertThat(matrix.getMinimumScoreForFirstClass()).isEqualTo(new BigDecimal("78.33"));

        assertThat(matrix.getScenarios()).hasSize(9);
        ExamScenarioRowDto row100 = matrix.getScenarios().get(8); // 100% exam score
        assertThat(row100.getExamScore()).isEqualTo(new BigDecimal("100.00"));
        assertThat(row100.getPredictedFinalMark()).isEqualTo(new BigDecimal("88.00"));
        assertThat(row100.getPredictedLetter()).isEqualTo("A+");
        assertThat(row100.getMeetsTarget()).isTrue();
    }

    @Test
    @DisplayName("Should calculate required remaining GPA and STRETCH feasibility for valid CGPA goal request")
    void calculateGpaGoalPlan_Achievable() {
        TargetGpaGoalRequestDto request = TargetGpaGoalRequestDto.builder()
                .currentCgpa(new BigDecimal("3.24"))
                .earnedCredits(64)
                .totalDegreeCredits(120)
                .targetCgpa(new BigDecimal("3.50"))
                .plannedSemestersRemaining(4)
                .build();

        TargetGpaGoalResultDto plan = gradeSimulatorService.calculateGpaGoalPlan(request);

        assertThat(plan).isNotNull();
        assertThat(plan.getRemainingCredits()).isEqualTo(56);
        // Required remaining GPA = (3.50*120 - 3.24*64) / 56 = (420 - 207.36) / 56 = 212.64 / 56 = 3.797 -> 3.80
        assertThat(plan.getRequiredRemainingGpa()).isEqualTo(new BigDecimal("3.80"));
        assertThat(plan.getIsFeasible()).isTrue();
        assertThat(plan.getFeasibilityStatus()).isEqualTo("STRETCH");
        assertThat(plan.getCurrentHonoursClassification()).contains("Second Class Lower (2:2)");
        assertThat(plan.getTargetHonoursClassification()).contains("Second Class Upper (2:1)");
        assertThat(plan.getRecommendedStrategies()).hasSize(3);
    }

    @Test
    @DisplayName("Should mark target CGPA as UNREALISTIC when required GPA exceeds maximum possible 4.00")
    void calculateGpaGoalPlan_UnrealisticTarget() {
        TargetGpaGoalRequestDto request = TargetGpaGoalRequestDto.builder()
                .currentCgpa(new BigDecimal("2.00"))
                .earnedCredits(100)
                .totalDegreeCredits(120)
                .targetCgpa(new BigDecimal("3.80"))
                .plannedSemestersRemaining(2)
                .build();

        TargetGpaGoalResultDto plan = gradeSimulatorService.calculateGpaGoalPlan(request);

        assertThat(plan).isNotNull();
        // Max possible CGPA = (2.00*100 + 4.00*20) / 120 = (200 + 80) / 120 = 2.33
        assertThat(plan.getMaxPossibleCgpa()).isEqualTo(new BigDecimal("2.33"));
        assertThat(plan.getIsFeasible()).isFalse();
        assertThat(plan.getFeasibilityStatus()).isEqualTo("UNREALISTIC");
        assertThat(plan.getStatusSummary()).contains("unachievable");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when GradeSimulatorRequestDto is null")
    void calculateRequiredMark_NullRequest() {
        assertThatThrownBy(() -> gradeSimulatorService.calculateRequiredMark(null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
