package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.event.*;
import com.unipulse.unipulse_backend.service.LearningEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events/learning")
@RequiredArgsConstructor
public class LearningEventController {

    private final LearningEventService learningEventService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LearningEventResponseDto>> ingestEvent(
            @Valid @RequestBody LearningEventIngestRequestDto request
    ) {
        LearningEventResponseDto response = learningEventService.ingestEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Learning event ingested successfully"));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LearningEventResponseDto>>> ingestBatchEvents(
            @Valid @RequestBody LearningEventBatchIngestRequestDto request
    ) {
        List<LearningEventResponseDto> response = learningEventService.ingestBatchEvents(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Batch learning events ingested successfully"));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LearningEventResponseDto>>> getEventsByStudent(
            @PathVariable UUID studentId
    ) {
        List<LearningEventResponseDto> response = learningEventService.getEventsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student learning events retrieved successfully"));
    }

    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LearningEventResponseDto>>> getEventsByModule(
            @PathVariable UUID moduleId
    ) {
        List<LearningEventResponseDto> response = learningEventService.getEventsByModule(moduleId);
        return ResponseEntity.ok(ApiResponse.success(response, "Module learning events retrieved successfully"));
    }

    @GetMapping("/analytics/student/{studentId}/module/{moduleId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<LearningEventAnalyticsDto>> getStudentEventAnalytics(
            @PathVariable UUID studentId,
            @PathVariable UUID moduleId
    ) {
        LearningEventAnalyticsDto response = learningEventService.getStudentEventAnalytics(studentId, moduleId);
        return ResponseEntity.ok(ApiResponse.success(response, "Student learning event analytics calculated successfully"));
    }
}
