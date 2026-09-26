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
        if (request == null) {
            throw new IllegalArgumentException("Target GPA goal request cannot be null");
        }

        BigDecimal currentCgpa = request.getCurrentCgpa() != null ? request.getCurrentCgpa() : new BigDecimal("3.24");
        Integer earnedCredits = request.getEarnedCredits() != null ? request.getEarnedCredits() : 64;
        Integer totalDegreeCredits = request.getTotalDegreeCredits() != null ? request.getTotalDegreeCredits() : 120;
        BigDecimal targetCgpa = request.getTargetCgpa() != null ? request.getTargetCgpa() : new BigDecimal("3.50");
        Integer plannedSemestersRemaining = request.getPlannedSemestersRemaining() != null ? request.getPlannedSemestersRemaining() : 4;

        currentCgpa = currentCgpa.setScale(2, RoundingMode.HALF_UP);
        targetCgpa = targetCgpa.setScale(2, RoundingMode.HALF_UP);

        int remainingCredits = Math.max(0, totalDegreeCredits - earnedCredits);

        BigDecimal currentQualityPoints = currentCgpa.multiply(new BigDecimal(earnedCredits)).setScale(4, RoundingMode.HALF_UP);
        BigDecimal targetQualityPoints = targetCgpa.multiply(new BigDecimal(totalDegreeCredits)).setScale(4, RoundingMode.HALF_UP);
        BigDecimal requiredRemainingPoints = targetQualityPoints.subtract(currentQualityPoints);

        // Max possible CGPA if 4.00 scored on all remaining credits
        BigDecimal maxQualityPoints = currentQualityPoints.add(new BigDecimal("4.00").multiply(new BigDecimal(remainingCredits)));
        BigDecimal maxPossibleCgpa = totalDegreeCredits > 0
                ? maxQualityPoints.divide(new BigDecimal(totalDegreeCredits), 2, RoundingMode.HALF_UP)
                : currentCgpa;

        BigDecimal requiredRemainingGpa;
        boolean isFeasible;
        String feasibilityStatus;
        String statusSummary;

        if (remainingCredits == 0) {
            requiredRemainingGpa = currentCgpa;
            if (currentCgpa.compareTo(targetCgpa) >= 0) {
                isFeasible = true;
                feasibilityStatus = "ACHIEVABLE";
                statusSummary = "Target degree classification already achieved! All degree credits completed.";
            } else {
                isFeasible = false;
                feasibilityStatus = "IMPOSSIBLE";
                statusSummary = "All degree credits have been completed. Target CGPA cannot be modified.";
            }
        } else {
            requiredRemainingGpa = requiredRemainingPoints.divide(new BigDecimal(remainingCredits), 2, RoundingMode.HALF_UP);

            if (requiredRemainingGpa.compareTo(BigDecimal.ZERO) <= 0) {
                requiredRemainingGpa = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                isFeasible = true;
                feasibilityStatus = "ACHIEVABLE";
                statusSummary = String.format("Target CGPA %s is already secured based on earned quality points!", targetCgpa.toPlainString());
            } else if (requiredRemainingGpa.compareTo(new BigDecimal("3.30")) <= 0) {
                isFeasible = true;
                feasibilityStatus = "EASY";
                statusSummary = String.format("Target CGPA %s is highly achievable with standard effort (Required remaining GPA: %s).",
                        targetCgpa.toPlainString(), requiredRemainingGpa.toPlainString());
            } else if (requiredRemainingGpa.compareTo(new BigDecimal("3.70")) <= 0) {
                isFeasible = true;
                feasibilityStatus = "MODERATE";
                statusSummary = String.format("Target CGPA %s is moderately challenging, requiring consistent B+ / A- performance (Required remaining GPA: %s).",
                        targetCgpa.toPlainString(), requiredRemainingGpa.toPlainString());
            } else if (requiredRemainingGpa.compareTo(new BigDecimal("4.00")) <= 0) {
                isFeasible = true;
                feasibilityStatus = "STRETCH";
                statusSummary = String.format("Target CGPA %s is a stretch goal, requiring near-perfect Distinction / A grade performance (Required remaining GPA: %s).",
                        targetCgpa.toPlainString(), requiredRemainingGpa.toPlainString());
            } else {
                isFeasible = false;
                feasibilityStatus = "UNREALISTIC";
                statusSummary = String.format("Target CGPA %s is mathematically unachievable (Requires %s GPA across remaining %d credits). Maximum possible CGPA is %s.",
                        targetCgpa.toPlainString(), requiredRemainingGpa.toPlainString(), remainingCredits, maxPossibleCgpa.toPlainString());
            }
        }

        String currentHonours = determineHonoursClassification(currentCgpa);
        String targetHonours = determineHonoursClassification(targetCgpa);

        List<GradeCombinationStrategyDto> strategies = generateRecommendedStrategies(
                requiredRemainingGpa, remainingCredits, plannedSemestersRemaining, maxPossibleCgpa, targetHonours);

        return TargetGpaGoalResultDto.builder()
                .currentCgpa(currentCgpa)
                .targetCgpa(targetCgpa)
                .earnedCredits(earnedCredits)
                .totalDegreeCredits(totalDegreeCredits)
                .remainingCredits(remainingCredits)
                .currentHonoursClassification(currentHonours)
                .targetHonoursClassification(targetHonours)
                .requiredRemainingGpa(requiredRemainingGpa)
                .maxPossibleCgpa(maxPossibleCgpa)
                .isFeasible(isFeasible)
                .feasibilityStatus(feasibilityStatus)
                .statusSummary(statusSummary)
                .formulaApplied("Required Remaining GPA = (Target CGPA * Total Credits - Current CGPA * Earned Credits) / Remaining Credits")
                .recommendedStrategies(strategies)
                .build();
    }

    private String determineHonoursClassification(BigDecimal cgpa) {
        if (cgpa == null) return "General Pass Degree";
        if (cgpa.compareTo(new BigDecimal("3.70")) >= 0) {
            return "First Class Honours / Distinction (GPA ≥ 3.70)";
        } else if (cgpa.compareTo(new BigDecimal("3.30")) >= 0) {
            return "Second Class Upper (2:1) (GPA ≥ 3.30)";
        } else if (cgpa.compareTo(new BigDecimal("2.70")) >= 0) {
            return "Second Class Lower (2:2) (GPA ≥ 2.70)";
        } else if (cgpa.compareTo(new BigDecimal("2.00")) >= 0) {
            return "General Pass Degree (GPA ≥ 2.00)";
        } else {
            return "Below Graduation Threshold (GPA < 2.00)";
        }
    }

    private List<GradeCombinationStrategyDto> generateRecommendedStrategies(
            BigDecimal requiredGpa, int remainingCredits, int remainingSemesters, BigDecimal maxPossibleCgpa, String targetHonours) {
        List<GradeCombinationStrategyDto> list = new ArrayList<>();

        int creditsPerSem = remainingSemesters > 0 ? Math.max(1, remainingCredits / remainingSemesters) : remainingCredits;

        // Strategy 1: Minimum Target Cadence
        String mix1;
        if (requiredGpa.compareTo(new BigDecimal("3.70")) >= 0) {
            mix1 = "Requires ~80% Grade A (4.0) and ~20% Grade A- (3.7) across remaining " + creditsPerSem + " credits/semester.";
        } else if (requiredGpa.compareTo(new BigDecimal("3.30")) >= 0) {
            mix1 = "Requires ~50% Grade A (4.0) and ~50% Grade B+ (3.3) across remaining " + creditsPerSem + " credits/semester.";
        } else if (requiredGpa.compareTo(new BigDecimal("3.00")) >= 0) {
            mix1 = "Requires ~30% Grade B+ (3.3) and ~70% Grade B (3.0) across remaining " + creditsPerSem + " credits/semester.";
        } else {
            mix1 = "Requires consistent Grade B / C+ average across remaining " + creditsPerSem + " credits/semester.";
        }

        list.add(GradeCombinationStrategyDto.builder()
                .strategyName("Minimum Target Cadence")
                .targetSemesterGpa(requiredGpa.min(new BigDecimal("4.00")))
                .gradeMixPattern(mix1)
                .description("Calculates the exact baseline performance required per semester to hit your target CGPA.")
                .feasibilityRating(requiredGpa.compareTo(new BigDecimal("4.00")) <= 0 ? "ACHIEVABLE" : "UNREALISTIC")
                .build());

        // Strategy 2: Distinction Push (Straight A's)
        list.add(GradeCombinationStrategyDto.builder()
                .strategyName("Distinction Push (Straight A Cadence)")
                .targetSemesterGpa(new BigDecimal("4.00"))
                .gradeMixPattern("100% Grade A (4.0) performance across all remaining " + remainingCredits + " credits.")
                .description("Maximizes your projected CGPA up to a highest possible " + maxPossibleCgpa.toPlainString() + ".")
                .feasibilityRating(maxPossibleCgpa.compareTo(new BigDecimal("3.70")) >= 0 ? "ACHIEVABLE" : "STRETCH")
                .build());

        // Strategy 3: Safety Buffer (+0.15 GPA)
        BigDecimal bufferGpa = requiredGpa.add(new BigDecimal("0.15")).min(new BigDecimal("4.00")).setScale(2, RoundingMode.HALF_UP);
        list.add(GradeCombinationStrategyDto.builder()
                .strategyName("Safety Buffer Target (+0.15 GPA)")
                .targetSemesterGpa(bufferGpa)
                .gradeMixPattern("Target a " + bufferGpa.toPlainString() + " semester GPA to build a buffer against unexpected exam score variance.")
                .description("Provides a safety margin to guarantee securing " + targetHonours + ".")
                .feasibilityRating(bufferGpa.compareTo(new BigDecimal("4.00")) <= 0 ? "MODERATE" : "STRETCH")
                .build());

        return list;
    }


    private DynamicScenarioMatrixDto generateScenarioMatrixInternal(
            String moduleCode, BigDecimal currentWeightedTotal, BigDecimal remainingWeight, BigDecimal targetMark) {
        List<ExamScenarioRowDto> scenarios = new ArrayList<>();
        BigDecimal[] sampleExamScores = new BigDecimal[]{
                new BigDecimal("0.00"), new BigDecimal("30.00"), new BigDecimal("40.00"),
                new BigDecimal("50.00"), new BigDecimal("60.00"), new BigDecimal("70.00"),
                new BigDecimal("80.00"), new BigDecimal("90.00"), new BigDecimal("100.00")
        };

        BigDecimal remainingFraction = remainingWeight.divide(HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal bestPossibleMark = currentWeightedTotal.add(remainingWeight).setScale(2, RoundingMode.HALF_UP);
        BigDecimal worstPossibleMark = currentWeightedTotal.setScale(2, RoundingMode.HALF_UP);

        BigDecimal minPassMark = new BigDecimal("45.00");
        BigDecimal minFirstClassMark = new BigDecimal("75.00");

        BigDecimal minimumScoreToPass = calculateMinimumRequiredExamScore(currentWeightedTotal, remainingWeight, minPassMark);
        BigDecimal minimumScoreForTarget = calculateMinimumRequiredExamScore(currentWeightedTotal, remainingWeight, targetMark);
        BigDecimal minimumScoreForFirstClass = calculateMinimumRequiredExamScore(currentWeightedTotal, remainingWeight, minFirstClassMark);

        for (BigDecimal examScore : sampleExamScores) {
            BigDecimal examContribution = examScore.multiply(remainingFraction).setScale(2, RoundingMode.HALF_UP);
            BigDecimal predictedFinalMark = currentWeightedTotal.add(examContribution).setScale(2, RoundingMode.HALF_UP);
            BigDecimal deltaToTarget = predictedFinalMark.subtract(targetMark).setScale(2, RoundingMode.HALF_UP);
            
            String letter = GradeMappingUtil.getLetterGrade(predictedFinalMark);
            BigDecimal gpaPoints = GradeMappingUtil.getGradePoint(letter);
            boolean meetsTarget = predictedFinalMark.compareTo(targetMark) >= 0;

            String statusLabel;
            if (meetsTarget && deltaToTarget.compareTo(BigDecimal.ZERO) == 0) {
                statusLabel = "Exact Target Met";
            } else if (meetsTarget) {
                statusLabel = "Target Exceeded (+ " + deltaToTarget.toPlainString() + "%)";
            } else if (predictedFinalMark.compareTo(minPassMark) >= 0) {
                statusLabel = "Pass Threshold (Gap: " + deltaToTarget.toPlainString() + "%)";
            } else {
                statusLabel = "At Risk / Fail";
            }

            String classification;
            if (predictedFinalMark.compareTo(new BigDecimal("75.00")) >= 0) {
                classification = "First Class Honours / A Grade (" + (gpaPoints != null ? gpaPoints : "4.0") + ")";
            } else if (predictedFinalMark.compareTo(new BigDecimal("65.00")) >= 0) {
                classification = "Upper Second (2:1) / B+ Grade (" + (gpaPoints != null ? gpaPoints : "3.3") + ")";
            } else if (predictedFinalMark.compareTo(new BigDecimal("55.00")) >= 0) {
                classification = "Lower Second (2:2) / B- Grade (" + (gpaPoints != null ? gpaPoints : "2.7") + ")";
            } else if (predictedFinalMark.compareTo(minPassMark) >= 0) {
                classification = "General Pass / C Grade (" + (gpaPoints != null ? gpaPoints : "2.0") + ")";
            } else {
                classification = "Failing Grade (0.0)";
            }

            scenarios.add(ExamScenarioRowDto.builder()
                    .examScore(examScore)
                    .predictedFinalMark(predictedFinalMark)
                    .predictedLetter(letter)
                    .predictedGpaPoints(gpaPoints)
                    .deltaToTarget(deltaToTarget)
                    .meetsTarget(meetsTarget)
                    .statusLabel(statusLabel)
                    .gradeClassification(classification)
                    .build());
        }

        return DynamicScenarioMatrixDto.builder()
                .moduleCode(moduleCode)
                .currentWeightedTotal(currentWeightedTotal)
                .remainingWeight(remainingWeight)
                .targetMark(targetMark)
                .bestPossibleMark(bestPossibleMark)
                .worstPossibleMark(worstPossibleMark)
                .minimumScoreToPass(minimumScoreToPass)
                .minimumScoreForTarget(minimumScoreForTarget)
                .minimumScoreForFirstClass(minimumScoreForFirstClass)
                .scenarios(scenarios)
                .build();
    }

    private BigDecimal calculateMinimumRequiredExamScore(BigDecimal currentTotal, BigDecimal remainingWeight, BigDecimal target) {
        if (currentTotal.compareTo(target) >= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (remainingWeight.compareTo(BigDecimal.ZERO) <= 0) {
            return new BigDecimal("100.01"); // Unachievable
        }
        BigDecimal gap = target.subtract(currentTotal);
        BigDecimal fraction = remainingWeight.divide(HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal required = gap.divide(fraction, 2, RoundingMode.HALF_UP);
        return required.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : required;
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
