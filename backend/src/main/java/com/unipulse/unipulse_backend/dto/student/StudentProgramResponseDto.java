package com.unipulse.unipulse_backend.dto.student;

import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProgramResponseDto {

    private UUID studentId;
    private String studentNumber;
    private String studentName;
    private String email;
    private UUID programId;
    private String programCode;
    private String programName;
    private Integer currentSemester;
    private BigDecimal gpa;
    private AcademicStatus academicStatus;
    private Integer enrollmentYear;
}
