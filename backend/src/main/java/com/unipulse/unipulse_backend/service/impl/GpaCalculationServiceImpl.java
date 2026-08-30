package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.assessment.AssessmentAnalyticsDto;
import com.unipulse.unipulse_backend.dto.enrollment.AssessmentScoreBreakdownDto;
import com.unipulse.unipulse_backend.dto.enrollment.ModuleGradeSummaryDto;
import com.unipulse.unipulse_backend.dto.student.DegreeClassTargetDto;
import com.unipulse.unipulse_backend.dto.student.SemesterGpaReportDto;
import com.unipulse.unipulse_backend.dto.student.StudentGpaSummaryDto;
import com.unipulse.unipulse_backend.dto.student.TargetGpaProjectionDto;
import com.unipulse.unipulse_backend.dto.student.WhatIfGpaSimulationRequestDto;
import com.unipulse.unipulse_backend.dto.student.WhatIfGpaSimulationResponseDto;
import com.unipulse.unipulse_backend.exception.ResourceNotFoundException;
import com.unipulse.unipulse_backend.model.entity.*;
import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import com.unipulse.unipulse_backend.repository.*;
import com.unipulse.unipulse_backend.service.GpaCalculationService;
import com.unipulse.unipulse_backend.util.GradeMappingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GpaCalculationServiceImpl implements GpaCalculationService {

    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;
    private final ModuleRepository moduleRepository;

    @Override
    @Transactional
    public ModuleGradeSummaryDto calculateAndPersistModuleGrade(UUID studentId, UUID moduleId, UUID semesterId) {
        Enrollment enrollment = enrollmentRepository.findByStudentUserIdAndModuleIdAndSemesterId(studentId, moduleId, semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found for student, module, and semester"));

        com.unipulse.unipulse_backend.model.entity.Module module = enrollment.getModule();
        List<AssessmentResult> results = assessmentResultRepository.findByStudentUserIdAndAssessmentModuleIdAndAssessmentSemesterId(studentId, moduleId, semesterId);


        BigDecimal caScoreObtained = BigDecimal.ZERO;
        BigDecimal weScoreObtained = BigDecimal.ZERO;
        List<AssessmentScoreBreakdownDto> breakdowns = new ArrayList<>();

        BigDecimal caWeightTotal = module.getCaWeightPercentage();
        BigDecimal weWeightTotal = module.getWeWeightPercentage();

        for (AssessmentResult res : results) {
            Assessment assessment = res.getAssessment();
            BigDecimal score = res.getScoreObtained() != null ? res.getScoreObtained() : BigDecimal.ZERO;
            BigDecimal maxScore = assessment.getMaxScore() != null && assessment.getMaxScore().compareTo(BigDecimal.ZERO) > 0 
                    ? assessment.getMaxScore() : new BigDecimal("100.00");
            
            BigDecimal percentage = score.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.00"));
            BigDecimal weight = assessment.getWeightPercentage() != null ? assessment.getWeightPercentage() : BigDecimal.ZERO;
            
            BigDecimal weightedContribution = score.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(weight);

            if (isWrittenExam(assessment.getType())) {
                weScoreObtained = weScoreObtained.add(weightedContribution);
            } else {
                caScoreObtained = caScoreObtained.add(weightedContribution);
            }

            breakdowns.add(AssessmentScoreBreakdownDto.builder()
                    .assessmentId(assessment.getId())
                    .assessmentTitle(assessment.getTitle())
                    .assessmentType(assessment.getType())
                    .weightPercentage(weight)
                    .maxScore(maxScore)
                    .scoreObtained(score)
                    .percentageScore(percentage.setScale(2, RoundingMode.HALF_UP))
                    .weightedContribution(weightedContribution.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        caScoreObtained = caScoreObtained.setScale(2, RoundingMode.HALF_UP);
        weScoreObtained = weScoreObtained.setScale(2, RoundingMode.HALF_UP);
        BigDecimal rawTotal = caScoreObtained.add(weScoreObtained).setScale(2, RoundingMode.HALF_UP);

        // Check 35% component threshold
        boolean caPass = caWeightTotal.compareTo(BigDecimal.ZERO) == 0 || caScoreObtained.compareTo(caWeightTotal.multiply(new BigDecimal("0.35"))) >= 0;
        boolean wePass = weWeightTotal.compareTo(BigDecimal.ZERO) == 0 || weScoreObtained.compareTo(weWeightTotal.multiply(new BigDecimal("0.35"))) >= 0;
        boolean meetsComponentThreshold = caPass && wePass;

        boolean isGpa = module.isGpaModule();
        String letterGrade;

        if (!isGpa) {
            // Non-GPA module mapping (P/F)
            if (meetsComponentThreshold && rawTotal.compareTo(new BigDecimal("45.00")) >= 0) {
                letterGrade = "P";
            } else {
                letterGrade = "F";
            }
        } else {
            letterGrade = GradeMappingUtil.determineFinalLetterGrade(rawTotal, meetsComponentThreshold);
        }

        BigDecimal gradePoint = GradeMappingUtil.getGradePoint(letterGrade);

        // Update enrollment
        enrollment.setFinalGrade(rawTotal);
        enrollment.setLetterGrade(letterGrade);
        enrollmentRepository.save(enrollment);

        return ModuleGradeSummaryDto.builder()
                .enrollmentId(enrollment.getId())
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .moduleTitle(module.getTitle())
                .creditHours(module.getCreditHoursDecimal())
                .isGpa(isGpa)
                .caWeightPercentage(caWeightTotal)
                .weWeightPercentage(weWeightTotal)
                .caScoreObtained(caScoreObtained)
                .weScoreObtained(weScoreObtained)
                .finalGrade(rawTotal)
                .letterGrade(letterGrade)
                .gradePoint(gradePoint)
                .meetsComponentThreshold(meetsComponentThreshold)
                .assessmentBreakdowns(breakdowns)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SemesterGpaReportDto calculateSemesterGpa(UUID studentId, UUID semesterId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentUserIdAndSemesterId(studentId, semesterId);

        BigDecimal totalWeightedGradePoints = BigDecimal.ZERO;
        BigDecimal totalGpaCredits = BigDecimal.ZERO;
        BigDecimal totalNgpaCredits = BigDecimal.ZERO;
        List<ModuleGradeSummaryDto> moduleSummaries = new ArrayList<>();

        for (Enrollment env : enrollments) {
            com.unipulse.unipulse_backend.model.entity.Module module = env.getModule();
            ModuleGradeSummaryDto summary = calculateAndPersistModuleGrade(studentId, module.getId(), semesterId);
            moduleSummaries.add(summary);

            if (Boolean.TRUE.equals(summary.getIsGpa())) {
                BigDecimal credits = summary.getCreditHours();
                BigDecimal point = summary.getGradePoint() != null ? summary.getGradePoint() : BigDecimal.ZERO;
                totalWeightedGradePoints = totalWeightedGradePoints.add(point.multiply(credits));
                totalGpaCredits = totalGpaCredits.add(credits);
            } else {
                totalNgpaCredits = totalNgpaCredits.add(summary.getCreditHours());
            }
        }

        BigDecimal sgpa = BigDecimal.ZERO;
        if (totalGpaCredits.compareTo(BigDecimal.ZERO) > 0) {
            sgpa = totalWeightedGradePoints.divide(totalGpaCredits, 2, RoundingMode.HALF_UP);
        }

        return SemesterGpaReportDto.builder()
                .semesterId(semester.getId())
                .semesterName(semester.getName())
                .academicYear(semester.getAcademicYear())
                .sgpa(sgpa)
                .semesterGpaCredits(totalGpaCredits)
                .semesterNgpaCredits(totalNgpaCredits)
                .modules(moduleSummaries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentGpaSummaryDto calculateCumulativeGpa(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<UUID> semesterIds = enrollmentRepository.findDistinctSemesterIdsByStudentId(studentId);
        List<SemesterGpaReportDto> semesterReports = new ArrayList<>();

        BigDecimal totalWeightedPoints = BigDecimal.ZERO;
        BigDecimal totalGpaCredits = BigDecimal.ZERO;
        BigDecimal totalNgpaCredits = BigDecimal.ZERO;

        for (UUID semId : semesterIds) {
            SemesterGpaReportDto report = calculateSemesterGpa(studentId, semId);
            semesterReports.add(report);

            totalGpaCredits = totalGpaCredits.add(report.getSemesterGpaCredits());
            totalNgpaCredits = totalNgpaCredits.add(report.getSemesterNgpaCredits());

            totalWeightedPoints = totalWeightedPoints.add(report.getSgpa().multiply(report.getSemesterGpaCredits()));
        }

        BigDecimal cgpa = BigDecimal.ZERO;
        if (totalGpaCredits.compareTo(BigDecimal.ZERO) > 0) {
            cgpa = totalWeightedPoints.divide(totalGpaCredits, 2, RoundingMode.HALF_UP);
        }

        AcademicDegreeClass degreeClass = AcademicDegreeClass.fromCgpa(cgpa);

        // Update student CGPA in DB
        student.setGpa(cgpa);
        studentRepository.save(student);

        String programName = student.getProgram() != null ? student.getProgram().getName() : "N/A";
        String studentName = student.getUser() != null ? student.getUser().getFirstName() + " " + student.getUser().getLastName() : "N/A";

        return StudentGpaSummaryDto.builder()
                .studentId(student.getUserId())
                .studentNumber(student.getStudentNumber())
                .studentName(studentName)
                .programName(programName)
                .currentSemester(student.getCurrentSemester())
                .cgpa(cgpa)
                .academicStatus(student.getAcademicStatus() != null ? student.getAcademicStatus() : AcademicStatus.GOOD_STANDING)
                .academicDegreeClass(degreeClass)
                .totalEarnedGpaCredits(totalGpaCredits)
                .totalEarnedNgpaCredits(totalNgpaCredits)
                .semesterReports(semesterReports)
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public TargetGpaProjectionDto computeDegreeClassTrajectory(UUID studentId) {
        StudentGpaSummaryDto currentSummary = calculateCumulativeGpa(studentId);

        BigDecimal earnedCredits = currentSummary.getTotalEarnedGpaCredits();
        BigDecimal currentCgpa = currentSummary.getCgpa();
        
        // Total program credits (default 120.00)
        BigDecimal totalProgramCredits = new BigDecimal("120.00");
        BigDecimal remainingCredits = totalProgramCredits.subtract(earnedCredits);
        if (remainingCredits.compareTo(BigDecimal.ZERO) <= 0) {
            remainingCredits = new BigDecimal("30.00"); // Default estimation for future remaining credits
        }

        // Max possible CGPA if student earns 4.00 in all remaining credits
        BigDecimal maxPoints = (currentCgpa.multiply(earnedCredits)).add(new BigDecimal("4.00").multiply(remainingCredits));
        BigDecimal totalCreditsAll = earnedCredits.add(remainingCredits);
        BigDecimal maxPossibleCgpa = maxPoints.divide(totalCreditsAll, 2, RoundingMode.HALF_UP);

        List<DegreeClassTargetDto> targets = new ArrayList<>();
        for (AcademicDegreeClass targetClass : AcademicDegreeClass.values()) {
            if (targetClass == AcademicDegreeClass.ACADEMIC_PROBATION) {
                continue;
            }

            BigDecimal targetMinCgpa = targetClass.getMinCgpa();
            // Math Formula: Required SGPA = ( (Target CGPA * TotalCredits) - (Current CGPA * EarnedCredits) ) / RemainingCredits
            BigDecimal requiredPoints = targetMinCgpa.multiply(totalCreditsAll).subtract(currentCgpa.multiply(earnedCredits));
            BigDecimal requiredSgpa = requiredPoints.divide(remainingCredits, 2, RoundingMode.HALF_UP);

            boolean isAchievable = requiredSgpa.compareTo(new BigDecimal("4.00")) <= 0;
            String message;
            if (requiredSgpa.compareTo(BigDecimal.ZERO) <= 0) {
                message = "Already achieved! Current CGPA secures " + targetClass.getDisplayName();
                requiredSgpa = BigDecimal.ZERO;
            } else if (isAchievable) {
                message = "Requires average SGPA of " + requiredSgpa + " across remaining credits to secure " + targetClass.getDisplayName();
            } else {
                message = "Unattainable. Mathematically requires SGPA of " + requiredSgpa + " (exceeds max 4.00)";
            }

            targets.add(DegreeClassTargetDto.builder()
                    .degreeClass(targetClass)
                    .targetMinCgpa(targetMinCgpa)
                    .requiredRemainingSgpa(requiredSgpa)
                    .isAchievable(isAchievable)
                    .statusMessage(message)
                    .build());
        }

        return TargetGpaProjectionDto.builder()
                .studentId(studentId)
                .currentCgpa(currentCgpa)
                .currentDegreeClass(currentSummary.getAcademicDegreeClass())
                .earnedGpaCredits(earnedCredits)
                .remainingEstimatedCredits(remainingCredits)
                .maxPossibleCgpa(maxPossibleCgpa)
                .targets(targets)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public WhatIfGpaSimulationResponseDto simulateWhatIfGpa(UUID studentId, WhatIfGpaSimulationRequestDto request) {
        StudentGpaSummaryDto currentSummary = calculateCumulativeGpa(studentId);
        BigDecimal currentCgpa = currentSummary.getCgpa();

        Map<UUID, BigDecimal> simulatedScoreMap = new HashMap<>();
        if (request != null && request.getSimulatedScores() != null) {
            for (WhatIfGpaSimulationRequestDto.SimulatedScoreDto item : request.getSimulatedScores()) {
                if (item.getAssessmentId() != null && item.getSimulatedScore() != null) {
                    simulatedScoreMap.put(item.getAssessmentId(), item.getSimulatedScore());
                }
            }
        }

        List<UUID> semesterIds = enrollmentRepository.findDistinctSemesterIdsByStudentId(studentId);
        List<ModuleGradeSummaryDto> simulatedModuleSummaries = new ArrayList<>();

        BigDecimal totalSimulatedWeightedPoints = BigDecimal.ZERO;
        BigDecimal totalSimulatedGpaCredits = BigDecimal.ZERO;

        for (UUID semId : semesterIds) {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentUserIdAndSemesterId(studentId, semId);
            for (Enrollment env : enrollments) {
                com.unipulse.unipulse_backend.model.entity.Module module = env.getModule();
                List<AssessmentResult> results = assessmentResultRepository.findByStudentUserIdAndAssessmentModuleIdAndAssessmentSemesterId(studentId, module.getId(), semId);

                BigDecimal caScore = BigDecimal.ZERO;
                BigDecimal weScore = BigDecimal.ZERO;
                List<AssessmentScoreBreakdownDto> breakdowns = new ArrayList<>();

                for (AssessmentResult res : results) {
                    Assessment assessment = res.getAssessment();
                    BigDecimal score = simulatedScoreMap.containsKey(assessment.getId())
                            ? simulatedScoreMap.get(assessment.getId())
                            : (res.getScoreObtained() != null ? res.getScoreObtained() : BigDecimal.ZERO);

                    BigDecimal maxScore = assessment.getMaxScore() != null && assessment.getMaxScore().compareTo(BigDecimal.ZERO) > 0
                            ? assessment.getMaxScore() : new BigDecimal("100.00");
                    BigDecimal weight = assessment.getWeightPercentage() != null ? assessment.getWeightPercentage() : BigDecimal.ZERO;
                    BigDecimal weightedContribution = score.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(weight);

                    if (isWrittenExam(assessment.getType())) {
                        weScore = weScore.add(weightedContribution);
                    } else {
                        caScore = caScore.add(weightedContribution);
                    }

                    breakdowns.add(AssessmentScoreBreakdownDto.builder()
                            .assessmentId(assessment.getId())
                            .assessmentTitle(assessment.getTitle())
                            .assessmentType(assessment.getType())
                            .weightPercentage(weight)
                            .maxScore(maxScore)
                            .scoreObtained(score)
                            .percentageScore(score.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP))
                            .weightedContribution(weightedContribution.setScale(2, RoundingMode.HALF_UP))
                            .build());
                }

                caScore = caScore.setScale(2, RoundingMode.HALF_UP);
                weScore = weScore.setScale(2, RoundingMode.HALF_UP);
                BigDecimal rawTotal = caScore.add(weScore).setScale(2, RoundingMode.HALF_UP);

                BigDecimal caWeightTotal = module.getCaWeightPercentage();
                BigDecimal weWeightTotal = module.getWeWeightPercentage();
                boolean caPass = caWeightTotal.compareTo(BigDecimal.ZERO) == 0 || caScore.compareTo(caWeightTotal.multiply(new BigDecimal("0.35"))) >= 0;
                boolean wePass = weWeightTotal.compareTo(BigDecimal.ZERO) == 0 || weScore.compareTo(weWeightTotal.multiply(new BigDecimal("0.35"))) >= 0;
                boolean meetsComponentThreshold = caPass && wePass;

                boolean isGpa = module.isGpaModule();
                String letterGrade;
                if (!isGpa) {
                    letterGrade = (meetsComponentThreshold && rawTotal.compareTo(new BigDecimal("45.00")) >= 0) ? "P" : "F";
                } else {
                    letterGrade = GradeMappingUtil.determineFinalLetterGrade(rawTotal, meetsComponentThreshold);
                }

                BigDecimal gradePoint = GradeMappingUtil.getGradePoint(letterGrade);

                if (isGpa) {
                    BigDecimal credits = module.getCreditHoursDecimal();
                    BigDecimal point = gradePoint != null ? gradePoint : BigDecimal.ZERO;
                    totalSimulatedWeightedPoints = totalSimulatedWeightedPoints.add(point.multiply(credits));
                    totalSimulatedGpaCredits = totalSimulatedGpaCredits.add(credits);
                }

                simulatedModuleSummaries.add(ModuleGradeSummaryDto.builder()
                        .enrollmentId(env.getId())
                        .moduleId(module.getId())
                        .moduleCode(module.getCode())
                        .moduleTitle(module.getTitle())
                        .creditHours(module.getCreditHoursDecimal())
                        .isGpa(isGpa)
                        .caWeightPercentage(caWeightTotal)
                        .weWeightPercentage(weWeightTotal)
                        .caScoreObtained(caScore)
                        .weScoreObtained(weScore)
                        .finalGrade(rawTotal)
                        .letterGrade(letterGrade)
                        .gradePoint(gradePoint)
                        .meetsComponentThreshold(meetsComponentThreshold)
                        .assessmentBreakdowns(breakdowns)
                        .build());
            }
        }

        BigDecimal simulatedCgpa = currentCgpa;
        if (totalSimulatedGpaCredits.compareTo(BigDecimal.ZERO) > 0) {
            simulatedCgpa = totalSimulatedWeightedPoints.divide(totalSimulatedGpaCredits, 2, RoundingMode.HALF_UP);
        }

        BigDecimal gpaDelta = simulatedCgpa.subtract(currentCgpa).setScale(2, RoundingMode.HALF_UP);

        return WhatIfGpaSimulationResponseDto.builder()
                .studentId(studentId)
                .currentCgpa(currentCgpa)
                .currentDegreeClass(currentSummary.getAcademicDegreeClass())
                .simulatedSgpa(simulatedCgpa)
                .simulatedCgpa(simulatedCgpa)
                .simulatedDegreeClass(AcademicDegreeClass.fromCgpa(simulatedCgpa))
                .gpaDelta(gpaDelta)
                .moduleSimulations(simulatedModuleSummaries)
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public AssessmentAnalyticsDto computeAssessmentAnalytics(UUID assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        List<AssessmentResult> results = assessmentResultRepository.findGradedResultsByAssessmentId(assessmentId);
        if (results.isEmpty()) {
            return AssessmentAnalyticsDto.builder()
                    .assessmentId(assessmentId)
                    .assessmentTitle(assessment.getTitle())
                    .totalSubmissions(0)
                    .meanScore(BigDecimal.ZERO)
                    .medianScore(BigDecimal.ZERO)
                    .highestScore(BigDecimal.ZERO)
                    .lowestScore(BigDecimal.ZERO)
                    .standardDeviation(BigDecimal.ZERO)
                    .passRatePercentage(BigDecimal.ZERO)
                    .gradeDistribution(Collections.emptyMap())
                    .build();
        }

        List<BigDecimal> scores = results.stream()
                .map(AssessmentResult::getScoreObtained)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());

        int count = scores.size();
        BigDecimal sum = scores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal mean = sum.divide(new BigDecimal(count), 2, RoundingMode.HALF_UP);

        BigDecimal median;
        if (count % 2 == 0) {
            median = scores.get(count / 2 - 1).add(scores.get(count / 2)).divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
        } else {
            median = scores.get(count / 2).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal highest = scores.get(count - 1).setScale(2, RoundingMode.HALF_UP);
        BigDecimal lowest = scores.get(0).setScale(2, RoundingMode.HALF_UP);

        // Standard Deviation
        double varianceSum = 0.0;
        double meanVal = mean.doubleValue();
        for (BigDecimal s : scores) {
            double diff = s.doubleValue() - meanVal;
            varianceSum += diff * diff;
        }
        BigDecimal stdDev = new BigDecimal(Math.sqrt(varianceSum / count)).setScale(2, RoundingMode.HALF_UP);

        // Pass rate (>= 35.00)
        long passCount = scores.stream().filter(s -> s.compareTo(new BigDecimal("35.00")) >= 0).count();
        BigDecimal passRate = new BigDecimal(passCount).divide(new BigDecimal(count), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP);

        Map<String, Integer> dist = new LinkedHashMap<>();
        for (BigDecimal s : scores) {
            String grade = GradeMappingUtil.getLetterGrade(s);
            dist.put(grade, dist.getOrDefault(grade, 0) + 1);
        }

        return AssessmentAnalyticsDto.builder()
                .assessmentId(assessmentId)
                .assessmentTitle(assessment.getTitle())
                .totalSubmissions(count)
                .meanScore(mean)
                .medianScore(median)
                .highestScore(highest)
                .lowestScore(lowest)
                .standardDeviation(stdDev)
                .passRatePercentage(passRate)
                .gradeDistribution(dist)
                .build();
    }

    private boolean isWrittenExam(AssessmentType type) {
        return type == AssessmentType.FINAL || type == AssessmentType.MIDTERM;
    }
}
