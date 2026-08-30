package com.unipulse.unipulse_backend.dto.event;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningEventIngestRequestDto {

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Module ID is required")
    private UUID moduleId;

    @NotBlank(message = "Event type is required")
    @Size(max = 100, message = "Event type must not exceed 100 characters")
    private String eventType;

    @NotBlank(message = "Event source is required")
    @Size(max = 50, message = "Event source must not exceed 50 characters")
    private String eventSource;

    private LocalDateTime timestamp;

    private JsonNode payload;
}
