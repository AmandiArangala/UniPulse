package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentTopicResponseDto {

    private UUID id;
    private UUID assessmentId;
    private String topicName;
    private BigDecimal weightContribution;
    private String description;
}
