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
public class AssessmentDifficultyDto {
    private UUID assessmentId;
    private String assessmentName;
    private String moduleCode;
    private String moduleTitle;
    private double weightage;
    private int totalStudentsEvaluated;
    private double averageScore;
    private double medianScore;
    private double standardDeviation;
    private double failureRate;
    private double passRate;
    private String difficultyBand;
    private List<TopicMasteryGapDto> topicMasteryGaps;
}
