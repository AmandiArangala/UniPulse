package com.unipulse.unipulse_backend.dto.event;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningEventResponseDto {

    private UUID id;
    private UUID studentId;
    private String studentRegistrationNumber;
    private String studentName;
    private UUID moduleId;
    private String moduleCode;
    private String eventType;
    private String eventSource;
    private LocalDateTime timestamp;
    private JsonNode payload;
}
