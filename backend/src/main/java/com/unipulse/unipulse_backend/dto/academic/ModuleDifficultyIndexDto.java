package com.unipulse.unipulse_backend.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDifficultyIndexDto {
    private UUID moduleId;
    private String moduleCode;
    private String moduleTitle;
    private int totalEnrolled;
    private double failureRate;
    private double meanFinalMark;
    private double repeatRate;
    private double withdrawalRate;
    private double difficultyIndexScore;
    private String difficultyBand; // LOW, MODERATE, HIGH, CRITICAL
    private String summaryInsight;
    private List<AssessmentDifficultyDto> assessments;
    private List<TopicMasteryGapDto> topicDiagnostics;
}
