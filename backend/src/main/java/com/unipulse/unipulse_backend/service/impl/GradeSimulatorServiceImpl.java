package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.student.*;
import com.unipulse.unipulse_backend.service.GradeSimulatorService;
import com.unipulse.unipulse_backend.util.GradeMappingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeSimulatorServiceImpl implements GradeSimulatorService {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    @Override
    public GradeSimulatorResultDto calculateRequiredMark(GradeSimulatorRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Grade simulator request cannot be null");
        }

        List<AssessmentScoreInput> assessments = request.getAssessments() != null
                ? request.getAssessments()
                : new ArrayList<>();

        BigDecimal completedWeight = BigDecimal.ZERO;
        BigDecimal remainingWeight = BigDecimal.ZERO;
        BigDecimal currentWeightedTotal = BigDecimal.ZERO;

        for (AssessmentScoreInput input : assessments) {
            if (input == null || input.getWeight() == null) {
                continue;
            }

            BigDecimal weight = input.getWeight();
            boolean completed = Boolean.TRUE.equals(input.getIsCompleted());

            if (completed) {
                completedWeight = completedWeight.add(weight);
                BigDecimal score = input.getScore() != null ? input.getScore() : BigDecimal.ZERO;
                // Weighted contribution = score * (weight / 100)
                BigDecimal contribution = score.multiply(weight).divide(HUNDRED, 4, RoundingMode.HALF_UP);
                currentWeightedTotal = currentWeightedTotal.add(contribution);
            } else {
                remainingWeight = remainingWeight.add(weight);
            }
        }

        completedWeight = completedWeight.setScale(2, RoundingMode.HALF_UP);
        remainingWeight = remainingWeight.setScale(2, RoundingMode.HALF_UP);
        currentWeightedTotal = currentWeightedTotal.setScale(2, RoundingMode.HALF_UP);

        BigDecimal targetTotalMark = request.getTargetTotalMark();
        if (targetTotalMark == null && request.getTargetGradeLetter() != null) {
            targetTotalMark = getTargetScoreFromLetter(request.getTargetGradeLetter());
        } else if (targetTotalMark == null) {
            targetTotalMark = new BigDecimal("75.00"); // Default Target: A grade
        }
        targetTotalMark = targetTotalMark.setScale(2, RoundingMode.HALF_UP);

        String targetGradeLetter = request.getTargetGradeLetter() != null
                ? request.getTargetGradeLetter()
                : GradeMappingUtil.getLetterGrade(targetTotalMark);

        BigDecimal requiredMarkOnRemaining;
        boolean isAchievable;
        String statusMessage;

        // Core Formula: Required Mark = (Target Total - Current Weighted Total) / (Remaining Weight / 100)
        if (remainingWeight.compareTo(BigDecimal.ZERO) == 0) {
            if (currentWeightedTotal.compareTo(targetTotalMark) >= 0) {
                requiredMarkOnRemaining = BigDecimal.ZERO;
                isAchievable = true;
                statusMessage = String.format("Target achieved! Current score is %s%% (Target: %s%%).",
                        currentWeightedTotal.toPlainString(), targetTotalMark.toPlainString());
            } else {
                requiredMarkOnRemaining = new BigDecimal("100.01");
                isAchievable = false;
                statusMessage = String.format("All assessments completed. Current score %s%% is below target %s%%.",
                        currentWeightedTotal.toPlainString(), targetTotalMark.toPlainString());
            }
        } else {
            BigDecimal remainingWeightFraction = remainingWeight.divide(HUNDRED, 6, RoundingMode.HALF_UP);
            BigDecimal gapToTarget = targetTotalMark.subtract(currentWeightedTotal);

            if (gapToTarget.compareTo(BigDecimal.ZERO) <= 0) {
                requiredMarkOnRemaining = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                isAchievable = true;
                statusMessage = String.format("Target %s secured! Your current score of %s%% exceeds target threshold.",
                        targetGradeLetter, currentWeightedTotal.toPlainString());
            } else {
                requiredMarkOnRemaining = gapToTarget.divide(remainingWeightFraction, 2, RoundingMode.HALF_UP);

                if (requiredMarkOnRemaining.compareTo(HUNDRED) <= 0) {
                    isAchievable = true;
                    statusMessage = String.format("Requires an average of %s%% across remaining assessments (%s%% weight) to achieve target %s (%s%%).",
                            requiredMarkOnRemaining.toPlainString(), remainingWeight.toPlainString(),
                            targetGradeLetter, targetTotalMark.toPlainString());
                } else {
                    isAchievable = false;
                    statusMessage = String.format("Unachievable target: requires %s%% on remaining assessments (%s%% weight), exceeding maximum possible 100%%.",
                            requiredMarkOnRemaining.toPlainString(), remainingWeight.toPlainString());
                }
            }
        }

        // Generate scenario matrix stub
        DynamicScenarioMatrixDto scenarioMatrix = generateScenarioMatrixInternal(
                request.getModuleCode(), currentWeightedTotal, remainingWeight, targetTotalMark);

        return GradeSimulatorResultDto.builder()
                .moduleCode(request.getModuleCode())
                .moduleTitle(request.getModuleTitle())
                .targetTotalMark(targetTotalMark)
                .targetGradeLetter(targetGradeLetter)
                .currentWeightedTotal(currentWeightedTotal)
                .completedWeight(completedWeight)
                .remainingWeight(remainingWeight)
                .requiredMarkOnRemaining(requiredMarkOnRemaining)
                .isAchievable(isAchievable)
                .statusMessage(statusMessage)
                .formulaApplied("Required Mark = (Target Total - Current Weighted Total) / (Remaining Weight / 100)")
                .scenarioMatrix(scenarioMatrix)
                .build();
    }

    @Override
    public DynamicScenarioMatrixDto generateScenarioMatrix(GradeSimulatorRequestDto request) {
        GradeSimulatorResultDto result = calculateRequiredMark(request);
        return result.getScenarioMatrix();
    }

    @Override
    public TargetGpaGoalResultDto calculateGpaGoalPlan(TargetGpaGoalRequestDto request) {
        return null;
    }

    private DynamicScenarioMatrixDto generateScenarioMatrixInternal(
            String moduleCode, BigDecimal currentWeightedTotal, BigDecimal remainingWeight, BigDecimal targetMark) {
        List<ExamScenarioRowDto> scenarios = new ArrayList<>();
        BigDecimal[] sampleExamScores = new BigDecimal[]{
                new BigDecimal("40.00"), new BigDecimal("50.00"), new BigDecimal("60.00"),
                new BigDecimal("70.00"), new BigDecimal("80.00"), new BigDecimal("90.00"),
                new BigDecimal("100.00")
        };

        BigDecimal remainingFraction = remainingWeight.divide(HUNDRED, 6, RoundingMode.HALF_UP);

        for (BigDecimal examScore : sampleExamScores) {
            BigDecimal examContribution = examScore.multiply(remainingFraction).setScale(2, RoundingMode.HALF_UP);
            BigDecimal predictedFinalMark = currentWeightedTotal.add(examContribution).setScale(2, RoundingMode.HALF_UP);
            String letter = GradeMappingUtil.getLetterGrade(predictedFinalMark);
            BigDecimal gpaPoints = GradeMappingUtil.getGradePoint(letter);
            boolean meetsTarget = predictedFinalMark.compareTo(targetMark) >= 0;

            String statusLabel;
            if (predictedFinalMark.compareTo(new BigDecimal("75.00")) >= 0) {
                statusLabel = "First Class / A Grade";
            } else if (predictedFinalMark.compareTo(new BigDecimal("65.00")) >= 0) {
                statusLabel = "Second Upper / B+ Grade";
            } else if (predictedFinalMark.compareTo(new BigDecimal("45.00")) >= 0) {
                statusLabel = "Pass Grade";
            } else {
                statusLabel = "Fail Risk";
            }

            scenarios.add(ExamScenarioRowDto.builder()
                    .examScore(examScore)
                    .predictedFinalMark(predictedFinalMark)
                    .predictedLetter(letter)
                    .predictedGpaPoints(gpaPoints)
                    .meetsTarget(meetsTarget)
                    .statusLabel(statusLabel)
                    .build());
        }

        return DynamicScenarioMatrixDto.builder()
                .moduleCode(moduleCode)
                .currentWeightedTotal(currentWeightedTotal)
                .remainingWeight(remainingWeight)
                .targetMark(targetMark)
                .scenarios(scenarios)
                .build();
    }

    private BigDecimal getTargetScoreFromLetter(String letter) {
        if (letter == null) return new BigDecimal("75.00");
        switch (letter.toUpperCase().trim()) {
            case "A+": return new BigDecimal("85.00");
            case "A": return new BigDecimal("75.00");
            case "A-": return new BigDecimal("70.00");
            case "B+": return new BigDecimal("65.00");
            case "B": return new BigDecimal("60.00");
            case "B-": return new BigDecimal("55.00");
            case "C+": return new BigDecimal("50.00");
            case "C": return new BigDecimal("45.00");
            default: return new BigDecimal("75.00");
        }
    }
}
