package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.student.AttentionIndicatorResultDto;
import com.unipulse.unipulse_backend.dto.student.AttentionSimulationRequestDto;

import java.util.List;
import java.util.UUID;

public interface AttentionIndicatorEngineService {

    AttentionIndicatorResultDto evaluateStudentAttention(UUID studentId);

    AttentionIndicatorResultDto evaluateCustomAttention(AttentionSimulationRequestDto request);

    List<AttentionIndicatorResultDto> evaluateBatchAttention(List<UUID> studentIds);
}
