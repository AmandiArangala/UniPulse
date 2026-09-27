package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.academic.AssessmentDifficultyDto;
import com.unipulse.unipulse_backend.dto.academic.TopicMasteryGapDto;

import java.util.List;
import java.util.UUID;

public interface AssessmentDifficultyService {
    AssessmentDifficultyDto analyzeAssessmentDifficulty(UUID assessmentId);
    List<AssessmentDifficultyDto> getAssessmentsDifficultyForModule(UUID moduleId);
    List<TopicMasteryGapDto> getTopicDiagnosticsForModule(UUID moduleId);
}
