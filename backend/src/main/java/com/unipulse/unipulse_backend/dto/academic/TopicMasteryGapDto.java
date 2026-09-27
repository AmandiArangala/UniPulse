package com.unipulse.unipulse_backend.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicMasteryGapDto {
    private UUID topicId;
    private String topicName;
    private int assessmentCount;
    private double averageScorePercentage;
    private double studentPassPercentage;
    private double masteryGapPercentage;
    private String difficultyRating; // WELL_MASTERED, MODERATE, CHALLENGING, CRITICAL_GAP
    private String recommendation;
}
