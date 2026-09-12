package com.unipulse.unipulse_backend.dto.advisor;

import com.unipulse.unipulse_backend.model.enums.InterventionStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicInterventionDto {

    private UUID id;
    private UUID studentId;
    private String studentName;
    private String studentNumber;
    private String studentAvatar;
    private UUID initiatorId;
    private String initiatorName;
    private String initiatorRole;
    private UUID moduleId;
    private String moduleCode;
    private String moduleTitle;
    private String reason;
    private String interventionType;
    private InterventionStatus status;
    private String priority;
    private String notes;
    private String followUpDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
