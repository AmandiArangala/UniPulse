package com.unipulse.unipulse_backend.dto.event;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningEventAnalyticsDto {

    private UUID studentId;
    private String studentRegistrationNumber;
    private String studentName;
    private UUID moduleId;
    private String moduleCode;
    private long totalEventsLogged;
    private Map<String, Long> eventTypeCounts;
    private LocalDateTime lastActiveTimestamp;
    private String engagementLevel;
}
