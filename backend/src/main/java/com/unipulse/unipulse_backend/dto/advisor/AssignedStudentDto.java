package com.unipulse.unipulse_backend.dto.advisor;

import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignedStudentDto {

    private UUID id;
    private UUID userId;
    private String studentNumber;
    private String fullName;
    private String email;
    private String avatarUrl;
    private UUID departmentId;
    private String departmentName;
    private String programCode;
    private String programName;
    private Integer currentSemester;
    private BigDecimal gpa;
    private AcademicStatus academicStatus;
    private String riskLevel;
    private BigDecimal attendanceRate;
    private Integer enrolledModulesCount;
    private Integer openInterventionsCount;
    private Integer enrollmentYear;
}
