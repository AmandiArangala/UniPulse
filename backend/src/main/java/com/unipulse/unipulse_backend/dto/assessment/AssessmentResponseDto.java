package com.unipulse.unipulse_backend.dto.assessment;

import com.unipulse.unipulse_backend.model.enums.AssessmentType;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResponseDto {

    private UUID id;
    private UUID moduleId;
    private String moduleCode;
    private String moduleTitle;
    private UUID semesterId;
    private String semesterName;
    private String title;
    private AssessmentType type;
    private BigDecimal weightPercentage;
    private BigDecimal maxScore;
    private OffsetDateTime dueDate;
    private Boolean isPublished;
    private List<AssessmentTopicResponseDto> topics;
}
