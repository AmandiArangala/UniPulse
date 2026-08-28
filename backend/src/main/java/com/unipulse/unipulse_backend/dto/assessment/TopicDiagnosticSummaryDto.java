package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicDiagnosticSummaryDto {

    private String topicName;
    private Integer assessmentCount;
    private BigDecimal totalTopicWeight;
    private List<String> assessmentTitles;
}
