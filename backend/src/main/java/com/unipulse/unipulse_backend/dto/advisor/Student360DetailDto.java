package com.unipulse.unipulse_backend.dto.advisor;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student360DetailDto {

    private AssignedStudentDto student;
    private List<StudentModulePerformanceDto> academicHistory;
    private List<StudentAttendanceTrendDto> attendanceTrends;
    private List<StudentRiskFactorDto> riskFactors;
    private List<AcademicInterventionDto> interventions;
    private BigDecimal totalCreditsEarned;
    private BigDecimal overallAttendanceRate;
    private String advisorNotes;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentModulePerformanceDto {
        private String moduleId;
        private String moduleCode;
        private String moduleTitle;
        private Integer creditHours;
        private BigDecimal currentGradeScore;
        private String letterGrade;
        private BigDecimal attendanceRate;
        private String status;
        private String riskAlert;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentAttendanceTrendDto {
        private String week;
        private BigDecimal attendanceRate;
        private Integer sessionsAttended;
        private Integer totalSessions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentRiskFactorDto {
        private String id;
        private String category;
        private String title;
        private String description;
        private String severity;
        private String detectedAt;
    }
}
