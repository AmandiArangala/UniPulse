package com.unipulse.unipulse_backend.service.impl;

import com.unipulse.unipulse_backend.dto.academic.AssessmentDifficultyDto;
import com.unipulse.unipulse_backend.dto.academic.TopicMasteryGapDto;
import com.unipulse.unipulse_backend.model.entity.Assessment;
import com.unipulse.unipulse_backend.model.entity.AssessmentResult;
import com.unipulse.unipulse_backend.model.entity.AssessmentTopic;
import com.unipulse.unipulse_backend.repository.AssessmentRepository;
import com.unipulse.unipulse_backend.repository.AssessmentResultRepository;
import com.unipulse.unipulse_backend.repository.AssessmentTopicRepository;
import com.unipulse.unipulse_backend.service.AssessmentDifficultyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentDifficultyServiceImpl implements AssessmentDifficultyService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AssessmentTopicRepository assessmentTopicRepository;

    @Override
    public AssessmentDifficultyDto analyzeAssessmentDifficulty(UUID assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found with id: " + assessmentId));

        List<AssessmentResult> results = assessmentResultRepository.findByAssessmentId(assessmentId);
        List<AssessmentTopic> topics = assessmentTopicRepository.findByAssessmentId(assessmentId);

        if (results == null || results.isEmpty()) {
            return buildDefaultDifficultyDto(assessment, topics);
        }

        List<Double> scores = new ArrayList<>();
        double maxMark = assessment.getMaxScore() != null ? assessment.getMaxScore().doubleValue() : 100.0;
        int passCount = 0;
        int failCount = 0;
        double sum = 0.0;

        for (AssessmentResult r : results) {
            if (r.getScoreObtained() != null) {
                double pct = (r.getScoreObtained().doubleValue() / maxMark) * 100.0;
                scores.add(pct);
                sum += pct;
                if (pct >= 50.0) {
                    passCount++;
                } else {
                    failCount++;
                }
            }
        }

        int total = scores.size();
        if (total == 0) {
            return buildDefaultDifficultyDto(assessment, topics);
        }

        double avgScore = sum / total;

        // Median
        Collections.sort(scores);
        double median = (total % 2 == 0)
                ? (scores.get(total / 2 - 1) + scores.get(total / 2)) / 2.0
                : scores.get(total / 2);

        // Standard Deviation
        double variance = 0.0;
        for (double score : scores) {
            variance += Math.pow(score - avgScore, 2);
        }
        double stdDev = Math.sqrt(variance / total);

        double failureRate = ((double) failCount / total) * 100.0;
        double passRate = ((double) passCount / total) * 100.0;

        String band;
        if (failureRate >= 40.0 || avgScore < 45.0) {
            band = "CRITICAL";
        } else if (failureRate >= 25.0 || avgScore < 55.0) {
            band = "HARD";
        } else if (failureRate >= 10.0 || avgScore < 70.0) {
            band = "MODERATE";
        } else {
            band = "EASY";
        }

        List<TopicMasteryGapDto> topicGaps = mapTopicsToDiagnosticGaps(topics, avgScore, passRate);

        return AssessmentDifficultyDto.builder()
                .assessmentId(assessment.getId())
                .assessmentName(assessment.getTitle())
                .moduleCode(assessment.getModule() != null ? assessment.getModule().getCode() : "N/A")
                .moduleTitle(assessment.getModule() != null ? assessment.getModule().getTitle() : "N/A")
                .weightage(assessment.getWeightPercentage() != null ? assessment.getWeightPercentage().doubleValue() : 0.0)
                .totalStudentsEvaluated(total)
                .averageScore(round(avgScore))
                .medianScore(round(median))
                .standardDeviation(round(stdDev))
                .failureRate(round(failureRate))
                .passRate(round(passRate))
                .difficultyBand(band)
                .topicMasteryGaps(topicGaps)
                .build();
    }

    @Override
    public List<AssessmentDifficultyDto> getAssessmentsDifficultyForModule(UUID moduleId) {
        List<Assessment> assessments = assessmentRepository.findByModuleId(moduleId);
        List<AssessmentDifficultyDto> list = new ArrayList<>();
        for (Assessment a : assessments) {
            list.add(analyzeAssessmentDifficulty(a.getId()));
        }
        return list;
    }

    @Override
    public List<TopicMasteryGapDto> getTopicDiagnosticsForModule(UUID moduleId) {
        List<Assessment> assessments = assessmentRepository.findByModuleId(moduleId);
        Map<String, List<Double>> topicScoresMap = new LinkedHashMap<>();
        Map<String, UUID> topicIdMap = new HashMap<>();

        for (Assessment a : assessments) {
            List<AssessmentTopic> topics = assessmentTopicRepository.findByAssessmentId(a.getId());
            List<AssessmentResult> results = assessmentResultRepository.findByAssessmentId(a.getId());
            double maxMark = a.getMaxScore() != null ? a.getMaxScore().doubleValue() : 100.0;

            for (AssessmentTopic topic : topics) {
                String key = topic.getTopicName().trim();
                topicIdMap.putIfAbsent(key, topic.getId());
                topicScoresMap.putIfAbsent(key, new ArrayList<>());

                for (AssessmentResult r : results) {
                    if (r.getScoreObtained() != null) {
                        double pct = (r.getScoreObtained().doubleValue() / maxMark) * 100.0;
                        topicScoresMap.get(key).add(pct);
                    }
                }
            }
        }

        List<TopicMasteryGapDto> diagnostics = new ArrayList<>();
        for (Map.Entry<String, List<Double>> entry : topicScoresMap.entrySet()) {
            String topicName = entry.getKey();
            List<Double> scores = entry.getValue();
            UUID topicId = topicIdMap.get(topicName);

            if (scores.isEmpty()) {
                diagnostics.add(TopicMasteryGapDto.builder()
                        .topicId(topicId)
                        .topicName(topicName)
                        .assessmentCount(1)
                        .averageScorePercentage(0.0)
                        .studentPassPercentage(0.0)
                        .masteryGapPercentage(100.0)
                        .difficultyRating("CRITICAL_GAP")
                        .recommendation("No student submissions recorded yet. Monitor upcoming assessments.")
                        .build());
                continue;
            }

            double sum = 0.0;
            int passCount = 0;
            for (double s : scores) {
                sum += s;
                if (s >= 50.0) passCount++;
            }

            double avgScore = sum / scores.size();
            double passPct = ((double) passCount / scores.size()) * 100.0;
            double gapPct = 100.0 - avgScore;

            String rating;
            String rec;
            if (gapPct >= 45.0 || passPct < 55.0) {
                rating = "CRITICAL_GAP";
                rec = "Schedule mandatory review tutorial and provide targeted practice problem sets.";
            } else if (gapPct >= 30.0 || passPct < 70.0) {
                rating = "CHALLENGING";
                rec = "Re-explain core concepts in lecture and assign supplementary learning materials.";
            } else if (gapPct >= 15.0) {
                rating = "MODERATE";
                rec = "Topic understanding is acceptable. Provide optional drill exercises.";
            } else {
                rating = "WELL_MASTERED";
                rec = "Students demonstrate strong mastery of this topic.";
            }

            diagnostics.add(TopicMasteryGapDto.builder()
                    .topicId(topicId)
                    .topicName(topicName)
                    .assessmentCount(scores.size())
                    .averageScorePercentage(round(avgScore))
                    .studentPassPercentage(round(passPct))
                    .masteryGapPercentage(round(gapPct))
                    .difficultyRating(rating)
                    .recommendation(rec)
                    .build());
        }

        return diagnostics;
    }

    private AssessmentDifficultyDto buildDefaultDifficultyDto(Assessment assessment, List<AssessmentTopic> topics) {
        return AssessmentDifficultyDto.builder()
                .assessmentId(assessment.getId())
                .assessmentName(assessment.getTitle())
                .moduleCode(assessment.getModule() != null ? assessment.getModule().getCode() : "N/A")
                .moduleTitle(assessment.getModule() != null ? assessment.getModule().getTitle() : "N/A")
                .weightage(assessment.getWeightPercentage() != null ? assessment.getWeightPercentage().doubleValue() : 0.0)
                .totalStudentsEvaluated(0)
                .averageScore(0.0)
                .medianScore(0.0)
                .standardDeviation(0.0)
                .failureRate(0.0)
                .passRate(0.0)
                .difficultyBand("MODERATE")
                .topicMasteryGaps(mapTopicsToDiagnosticGaps(topics, 0.0, 0.0))
                .build();
    }

    private List<TopicMasteryGapDto> mapTopicsToDiagnosticGaps(List<AssessmentTopic> topics, double avgScore, double passRate) {
        List<TopicMasteryGapDto> dtos = new ArrayList<>();
        if (topics == null) return dtos;
        for (AssessmentTopic t : topics) {
            double gap = 100.0 - avgScore;
            String rating = gap >= 40.0 ? "CRITICAL_GAP" : (gap >= 25.0 ? "CHALLENGING" : "MODERATE");
            dtos.add(TopicMasteryGapDto.builder()
                    .topicId(t.getId())
                    .topicName(t.getTopicName())
                    .assessmentCount(1)
                    .averageScorePercentage(round(avgScore))
                    .studentPassPercentage(round(passRate))
                    .masteryGapPercentage(round(gap))
                    .difficultyRating(rating)
                    .recommendation("Analyze individual item responses to optimize module delivery.")
                    .build());
        }
        return dtos;
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
