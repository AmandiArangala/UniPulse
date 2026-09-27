package com.unipulse.unipulse_backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventDto {
    private UUID eventId;
    private String category; // ASSESSMENT, ATTENDANCE, LEARNING_EVENT, ATTENTION_ALERT, INTERVENTION, ENROLLMENT
    private String title;
    private String description;
    private String timestamp;
    private String severity; // INFO, SUCCESS, WARNING, CRITICAL
    private String moduleCode;
    private String initiatorOrSource;
    private Map<String, Object> metadata;
}
