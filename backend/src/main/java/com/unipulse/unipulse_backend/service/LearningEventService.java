package com.unipulse.unipulse_backend.service;

import com.unipulse.unipulse_backend.dto.event.*;

import java.util.List;
import java.util.UUID;

public interface LearningEventService {

    LearningEventResponseDto ingestEvent(LearningEventIngestRequestDto dto);

    List<LearningEventResponseDto> ingestBatchEvents(LearningEventBatchIngestRequestDto dto);

    List<LearningEventResponseDto> getEventsByStudent(UUID studentId);

    List<LearningEventResponseDto> getEventsByModule(UUID moduleId);

    List<LearningEventResponseDto> getEventsByStudentAndModule(UUID studentId, UUID moduleId);

    LearningEventAnalyticsDto getStudentEventAnalytics(UUID studentId, UUID moduleId);
}
