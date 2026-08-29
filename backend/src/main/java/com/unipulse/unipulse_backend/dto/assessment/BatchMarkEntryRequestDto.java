package com.unipulse.unipulse_backend.dto.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchMarkEntryRequestDto {

    @NotNull(message = "Assessment ID is required")
    private UUID assessmentId;

    @NotEmpty(message = "Marks list cannot be empty")
    @Valid
    private List<MarkEntryRequestDto> marks;
}
