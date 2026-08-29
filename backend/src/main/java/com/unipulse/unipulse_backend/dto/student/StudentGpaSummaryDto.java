package com.unipulse.unipulse_backend.dto.student;

import com.unipulse.unipulse_backend.model.enums.AcademicDegreeClass;
import com.unipulse.unipulse_backend.model.enums.AcademicStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGpaSummaryDto {

    private UUID studentId;

    private String studentNumber;

    private String studentName;

    private String programName;

    private Integer currentSemester;

    private BigDecimal cgpa;

    private AcademicStatus academicStatus;

    private AcademicDegreeClass academicDegreeClass;

    private BigDecimal totalEarnedGpaCredits;

    private BigDecimal totalEarnedNgpaCredits;

    private List<SemesterGpaReportDto> semesterReports;
}
