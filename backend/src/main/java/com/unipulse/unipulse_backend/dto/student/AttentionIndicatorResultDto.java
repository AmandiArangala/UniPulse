package com.unipulse.unipulse_backend.dto.student;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttentionIndicatorResultDto {

    private UUID studentId;
    private String studentName;
    private String studentNumber;
    private String programName;

    private int totalAttentionScore; // 0-100
    private AttentionCategoryTier categoryTier;
    private String badgeLabel; // Non-stigmatizing UI badge text e.g. "Good Standing"
    private String badgeColor; // UI color theme ("emerald", "amber", "rose")

    private String summaryDiagnostic;
    private String advisorDiagnosticNote;
    private String lecturerDiagnosticNote;

    private List<AttentionTriggerDetailDto> triggerDetails;
    private List<String> recommendedInterventions;

    private OffsetDateTime evaluatedAt;
}
