package com.unipulse.unipulse_backend.dto.enrollment;

import com.unipulse.unipulse_backend.model.enums.EnrollmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleEnrollmentResponseDto {

    private UUID id;
    private UUID studentId;
    private String studentNumber;
    private String studentName;
    private UUID moduleId;
    private String moduleCode;
    private String moduleTitle;
    private Integer creditHours;
    private UUID semesterId;
    private String semesterName;
    private BigDecimal finalGrade;
    private String letterGrade;
    private EnrollmentStatus status;
    private OffsetDateTime enrolledAt;
}
