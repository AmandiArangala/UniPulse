package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.AssessmentDifficultyDto;
import com.unipulse.unipulse_backend.dto.academic.ModuleDifficultyIndexDto;
import com.unipulse.unipulse_backend.dto.academic.TopicMasteryGapDto;
import com.unipulse.unipulse_backend.model.entity.Enrollment;
import com.unipulse.unipulse_backend.model.entity.Module;
import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import com.unipulse.unipulse_backend.repository.EnrollmentRepository;
import com.unipulse.unipulse_backend.repository.ModuleRepository;
import com.unipulse.unipulse_backend.service.AssessmentDifficultyService;
import com.unipulse.unipulse_backend.service.ModuleDifficultyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModuleDifficultyServiceImpl implements ModuleDifficultyService {

    private final ModuleRepository moduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentDifficultyService assessmentDifficultyService;

    @Override
    public ModuleDifficultyIndexDto calculateModuleDifficultyIndex(UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found with id: " + moduleId));

        List<Enrollment> enrollments = enrollmentRepository.findByModuleId(moduleId);
        List<AssessmentDifficultyDto> assessments = assessmentDifficultyService.getAssessmentsDifficultyForModule(moduleId);
        List<TopicMasteryGapDto> topicDiagnostics = assessmentDifficultyService.getTopicDiagnosticsForModule(moduleId);

        if (enrollments == null || enrollments.isEmpty()) {
            return buildDefaultModuleDifficultyIndex(module, assessments, topicDiagnostics);
        }

        int totalEnrolled = enrollments.size();
        int failedCount = 0;
        int withdrawnCount = 0;
        double gradeSum = 0.0;
        int gradedCount = 0;

        Set<UUID> studentIdsSeen = new HashSet<>();
        int repeatStudentCount = 0;

        for (Enrollment e : enrollments) {
            UUID studentId = e.getStudent() != null ? e.getStudent().getUserId() : null;
            if (studentId != null) {
                if (!studentIdsSeen.add(studentId)) {
                    repeatStudentCount++;
                }
            }

            if (e.getStatus() == EnrollmentStatus.WITHDRAWN || e.getStatus() == EnrollmentStatus.DROPPED) {
                withdrawnCount++;
            }

            if (e.getFinalGrade() != null) {
                double g = e.getFinalGrade().doubleValue();
                gradeSum += g;
                gradedCount++;
                if (g < 40.0 || (e.getLetterGrade() != null && e.getLetterGrade().equalsIgnoreCase("F"))) {
                    failedCount++;
                }
            } else if (e.getStatus() == EnrollmentStatus.FAILED) {
                failedCount++;
            }
        }

        double failureRate = ((double) failedCount / totalEnrolled) * 100.0;
        double withdrawalRate = ((double) withdrawnCount / totalEnrolled) * 100.0;
        double repeatRate = ((double) repeatStudentCount / totalEnrolled) * 100.0;

        double meanFinalMark;
        if (gradedCount > 0) {
            meanFinalMark = gradeSum / gradedCount;
        } else if (!assessments.isEmpty()) {
            double assSum = 0;
            for (AssessmentDifficultyDto a : assessments) {
                assSum += a.getAverageScore();
            }
            meanFinalMark = assSum / assessments.size();
        } else {
            meanFinalMark = 65.0; // safe baseline fallback
        }

        // Formula: 0.35 * FailRate + 0.25 * (100 - MeanMark) + 0.20 * RepeatRate + 0.20 * WithdrawalRate
        double mdiScore = (0.35 * failureRate)
                + (0.25 * (100.0 - meanFinalMark))
                + (0.20 * repeatRate)
                + (0.20 * withdrawalRate);

        mdiScore = Math.max(0.0, Math.min(100.0, mdiScore));

        String band;
        if (mdiScore >= 70.0) {
            band = "CRITICAL_DIFFICULTY";
        } else if (mdiScore >= 50.0) {
            band = "HIGH";
        } else if (mdiScore >= 30.0) {
            band = "MODERATE";
        } else {
            band = "LOW";
        }

        String summary = generateInsightSummary(band, failureRate, meanFinalMark, withdrawalRate, repeatRate);

        return ModuleDifficultyIndexDto.builder()
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .moduleTitle(module.getTitle())
                .totalEnrolled(totalEnrolled)
                .failureRate(round(failureRate))
                .meanFinalMark(round(meanFinalMark))
                .repeatRate(round(repeatRate))
                .withdrawalRate(round(withdrawalRate))
                .difficultyIndexScore(round(mdiScore))
                .difficultyBand(band)
                .summaryInsight(summary)
                .assessments(assessments)
                .topicDiagnostics(topicDiagnostics)
                .build();
    }

    @Override
    public List<ModuleDifficultyIndexDto> getAllModuleDifficultyIndexes() {
        List<Module> modules = moduleRepository.findAll();
        List<ModuleDifficultyIndexDto> results = new ArrayList<>();
        for (Module m : modules) {
            results.add(calculateModuleDifficultyIndex(m.getId()));
        }
        return results;
    }

    private ModuleDifficultyIndexDto buildDefaultModuleDifficultyIndex(
            Module module,
            List<AssessmentDifficultyDto> assessments,
            List<TopicMasteryGapDto> topicDiagnostics
    ) {
        return ModuleDifficultyIndexDto.builder()
                .moduleId(module.getId())
                .moduleCode(module.getCode())
                .moduleTitle(module.getTitle())
                .totalEnrolled(0)
                .failureRate(0.0)
                .meanFinalMark(0.0)
                .repeatRate(0.0)
                .withdrawalRate(0.0)
                .difficultyIndexScore(0.0)
                .difficultyBand("LOW")
                .summaryInsight("No active student enrollments available for calculating difficulty index.")
                .assessments(assessments)
                .topicDiagnostics(topicDiagnostics)
                .build();
    }

    private String generateInsightSummary(String band, double failRate, double meanMark, double withdrawalRate, double repeatRate) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Module difficulty categorized as %s. ", band.replace('_', ' ')));
        if (failRate > 25.0) {
            sb.append(String.format("High failure rate of %.1f%% detected. ", failRate));
        }
        if (meanMark < 50.0) {
            sb.append(String.format("Average student score is low at %.1f%%. ", meanMark));
        }
        if (withdrawalRate > 15.0) {
            sb.append(String.format("Noticeable withdrawal rate of %.1f%%. ", withdrawalRate));
        }
        if (repeatRate > 10.0) {
            sb.append(String.format("Repeat enrollment rate is %.1f%%. ", repeatRate));
        }
        if (sb.length() == 0 || band.equals("LOW")) {
            sb.append("Student overall performance and progression rates are stable.");
        }
        return sb.toString().trim();
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
