package com.unipulse.unipulse_backend.dto.assessment;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResultResponseDto {

    private UUID id;

    private UUID assessmentId;

    private String assessmentTitle;

    private UUID studentId;

    private String studentNumber;

    private String studentName;

    private BigDecimal scoreObtained;

    private BigDecimal maxScore;

    private BigDecimal percentageScore;

    private OffsetDateTime submittedAt;

    private Boolean isLate;

    private String feedback;

    private String fileUrl;

    private String fileName;

    private Long fileSizeBytes;
}
