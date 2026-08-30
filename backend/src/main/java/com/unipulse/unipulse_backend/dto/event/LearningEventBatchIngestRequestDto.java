package com.unipulse.unipulse_backend.dto.event;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningEventBatchIngestRequestDto {

    @NotEmpty(message = "Learning event list cannot be empty")
    @Valid
    private List<LearningEventIngestRequestDto> events;
}
