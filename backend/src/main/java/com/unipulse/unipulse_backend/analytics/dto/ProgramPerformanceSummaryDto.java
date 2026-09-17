package com.unipulse.unipulse_backend.analytics.dto;

import java.math.BigDecimal;

public class ProgramPerformanceSummaryDto {

    private String programCode;
    private String programName;
    private String degreeLevel;
    private String facultyName;
    private String semesterName;
    private Integer academicYear;
    private Long totalEnrolledStudents;
    private Long totalModulesTaught;
    private BigDecimal avgAssessmentScore;
    private BigDecimal avgAttendanceRate;
    private BigDecimal avgSubmissionRate;
    private BigDecimal avgEngagementScore;
    private BigDecimal avgAcademicHealthScore;
    private Long criticalStudentsCount;
    private Long attentionRequiredStudentsCount;
    private Long excellentStudentsCount;

    public ProgramPerformanceSummaryDto() {}

    public ProgramPerformanceSummaryDto(String programCode, String programName, String degreeLevel, String facultyName,
                                        String semesterName, Integer academicYear, Long totalEnrolledStudents,
                                        Long totalModulesTaught, BigDecimal avgAssessmentScore, BigDecimal avgAttendanceRate,
                                        BigDecimal avgSubmissionRate, BigDecimal avgEngagementScore,
                                        BigDecimal avgAcademicHealthScore, Long criticalStudentsCount,
                                        Long attentionRequiredStudentsCount, Long excellentStudentsCount) {
        this.programCode = programCode;
        this.programName = programName;
        this.degreeLevel = degreeLevel;
        this.facultyName = facultyName;
        this.semesterName = semesterName;
        this.academicYear = academicYear;
        this.totalEnrolledStudents = totalEnrolledStudents;
        this.totalModulesTaught = totalModulesTaught;
        this.avgAssessmentScore = avgAssessmentScore;
        this.avgAttendanceRate = avgAttendanceRate;
        this.avgSubmissionRate = avgSubmissionRate;
        this.avgEngagementScore = avgEngagementScore;
        this.avgAcademicHealthScore = avgAcademicHealthScore;
        this.criticalStudentsCount = criticalStudentsCount;
        this.attentionRequiredStudentsCount = attentionRequiredStudentsCount;
        this.excellentStudentsCount = excellentStudentsCount;
    }

    public String getProgramCode() { return programCode; }
    public void setProgramCode(String programCode) { this.programCode = programCode; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public String getDegreeLevel() { return degreeLevel; }
    public void setDegreeLevel(String degreeLevel) { this.degreeLevel = degreeLevel; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public Long getTotalEnrolledStudents() { return totalEnrolledStudents; }
    public void setTotalEnrolledStudents(Long totalEnrolledStudents) { this.totalEnrolledStudents = totalEnrolledStudents; }

    public Long getTotalModulesTaught() { return totalModulesTaught; }
    public void setTotalModulesTaught(Long totalModulesTaught) { this.totalModulesTaught = totalModulesTaught; }

    public BigDecimal getAvgAssessmentScore() { return avgAssessmentScore; }
    public void setAvgAssessmentScore(BigDecimal avgAssessmentScore) { this.avgAssessmentScore = avgAssessmentScore; }

    public BigDecimal getAvgAttendanceRate() { return avgAttendanceRate; }
    public void setAvgAttendanceRate(BigDecimal avgAttendanceRate) { this.avgAttendanceRate = avgAttendanceRate; }

    public BigDecimal getAvgSubmissionRate() { return avgSubmissionRate; }
    public void setAvgSubmissionRate(BigDecimal avgSubmissionRate) { this.avgSubmissionRate = avgSubmissionRate; }

    public BigDecimal getAvgEngagementScore() { return avgEngagementScore; }
    public void setAvgEngagementScore(BigDecimal avgEngagementScore) { this.avgEngagementScore = avgEngagementScore; }

    public BigDecimal getAvgAcademicHealthScore() { return avgAcademicHealthScore; }
    public void setAvgAcademicHealthScore(BigDecimal avgAcademicHealthScore) { this.avgAcademicHealthScore = avgAcademicHealthScore; }

    public Long getCriticalStudentsCount() { return criticalStudentsCount; }
    public void setCriticalStudentsCount(Long criticalStudentsCount) { this.criticalStudentsCount = criticalStudentsCount; }

    public Long getAttentionRequiredStudentsCount() { return attentionRequiredStudentsCount; }
    public void setAttentionRequiredStudentsCount(Long attentionRequiredStudentsCount) { this.attentionRequiredStudentsCount = attentionRequiredStudentsCount; }

    public Long getExcellentStudentsCount() { return excellentStudentsCount; }
    public void setExcellentStudentsCount(Long excellentStudentsCount) { this.excellentStudentsCount = excellentStudentsCount; }
}
