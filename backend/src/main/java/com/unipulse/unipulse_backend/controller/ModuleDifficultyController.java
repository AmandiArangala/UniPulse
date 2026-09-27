package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.academic.AssessmentDifficultyDto;
import com.unipulse.unipulse_backend.dto.academic.ModuleDifficultyIndexDto;
import com.unipulse.unipulse_backend.dto.academic.TopicMasteryGapDto;
import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.service.AssessmentDifficultyService;
import com.unipulse.unipulse_backend.service.ModuleDifficultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/difficulty")
@RequiredArgsConstructor
public class ModuleDifficultyController {

    private final ModuleDifficultyService moduleDifficultyService;
    private final AssessmentDifficultyService assessmentDifficultyService;

    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ModuleDifficultyIndexDto>> getModuleDifficultyIndex(@PathVariable UUID moduleId) {
        ModuleDifficultyIndexDto index = moduleDifficultyService.calculateModuleDifficultyIndex(moduleId);
        return ResponseEntity.ok(ApiResponse.success(index, "Module difficulty index retrieved successfully"));
    }

    @GetMapping("/module/{moduleId}/topics")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TopicMasteryGapDto>>> getTopicDiagnostics(@PathVariable UUID moduleId) {
        List<TopicMasteryGapDto> topics = assessmentDifficultyService.getTopicDiagnosticsForModule(moduleId);
        return ResponseEntity.ok(ApiResponse.success(topics, "Topic mastery diagnostics retrieved successfully"));
    }

    @GetMapping("/module/{moduleId}/assessments")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AssessmentDifficultyDto>>> getModuleAssessmentsDifficulty(@PathVariable UUID moduleId) {
        List<AssessmentDifficultyDto> assessments = assessmentDifficultyService.getAssessmentsDifficultyForModule(moduleId);
        return ResponseEntity.ok(ApiResponse.success(assessments, "Module assessments difficulty analytics retrieved successfully"));
    }

    @GetMapping("/assessment/{assessmentId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssessmentDifficultyDto>> getAssessmentDifficulty(@PathVariable UUID assessmentId) {
        AssessmentDifficultyDto difficulty = assessmentDifficultyService.analyzeAssessmentDifficulty(assessmentId);
        return ResponseEntity.ok(ApiResponse.success(difficulty, "Assessment difficulty analytics retrieved successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ModuleDifficultyIndexDto>>> getAllModuleDifficultyIndexes() {
        List<ModuleDifficultyIndexDto> list = moduleDifficultyService.getAllModuleDifficultyIndexes();
        return ResponseEntity.ok(ApiResponse.success(list, "All module difficulty indexes retrieved successfully"));
    }
}
