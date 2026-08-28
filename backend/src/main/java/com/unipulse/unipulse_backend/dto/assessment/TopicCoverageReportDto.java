package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicCoverageReportDto {

    private UUID moduleId;
    private String moduleCode;
    private String moduleTitle;
    private UUID semesterId;
    private String semesterName;
    private Integer totalTopicsCount;
    private List<TopicDiagnosticSummaryDto> topics;
}
