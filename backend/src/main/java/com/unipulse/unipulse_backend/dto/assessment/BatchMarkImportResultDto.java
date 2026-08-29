package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchMarkImportResultDto {

    private UUID assessmentId;

    private Integer totalProcessed;

    private Integer successCount;

    private Integer failureCount;

    private List<MarkImportErrorDto> errors;

    private List<AssessmentResultResponseDto> recordedResults;
}
