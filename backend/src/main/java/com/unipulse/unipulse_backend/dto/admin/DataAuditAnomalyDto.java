package com.unipulse.unipulse_backend.dto.admin;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataAuditAnomalyDto {

    private UUID id;
    private String title;
    private String anomalyType; // MISSING_MARKS, INCOMPLETE_ENROLLMENT, ORPHANED_RECORD, UNASSIGNED_MODULE
    private String severity;    // HIGH, MEDIUM, LOW
    private String entityType;  // Assessment, Student, ModuleEnrollment, Department
    private String entityId;
    private String affectedName;
    private String departmentName;
    private String description;
    private String recommendedAction;
    private String status;      // OPEN, IN_PROGRESS, RESOLVED, DISMISSED
    private OffsetDateTime detectedAt;
    private OffsetDateTime resolvedAt;
}
