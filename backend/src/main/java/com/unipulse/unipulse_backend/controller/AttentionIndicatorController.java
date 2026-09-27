package com.unipulse.unipulse_backend.controller;

import com.unipulse.unipulse_backend.dto.common.ApiResponse;
import com.unipulse.unipulse_backend.dto.student.AttentionIndicatorResultDto;
import com.unipulse.unipulse_backend.dto.student.AttentionSimulationRequestDto;
import com.unipulse.unipulse_backend.service.AttentionIndicatorEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic-intelligence/attention-indicator")
@RequiredArgsConstructor
public class AttentionIndicatorController {

    private final AttentionIndicatorEngineService attentionIndicatorEngineService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttentionIndicatorResultDto>> getStudentAttentionIndicator(
            @PathVariable UUID studentId
    ) {
        AttentionIndicatorResultDto result = attentionIndicatorEngineService.evaluateStudentAttention(studentId);
        return ResponseEntity.ok(ApiResponse.success(result, "Attention indicator evaluated successfully"));
    }

    @PostMapping("/simulate")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttentionIndicatorResultDto>> simulateAttentionIndicator(
            @Valid @RequestBody AttentionSimulationRequestDto request
    ) {
        AttentionIndicatorResultDto result = attentionIndicatorEngineService.evaluateCustomAttention(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Attention indicator simulation completed successfully"));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADVISOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttentionIndicatorResultDto>>> evaluateBatchAttention(
            @RequestBody List<UUID> studentIds
    ) {
        List<AttentionIndicatorResultDto> results = attentionIndicatorEngineService.evaluateBatchAttention(studentIds);
        return ResponseEntity.ok(ApiResponse.success(results, "Batch attention indicator evaluations completed successfully"));
    }
}
