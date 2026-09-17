package com.unipulse.unipulse_backend.analytics.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AtRiskStudentOlapDto {

    private UUID factId;
    private UUID studentKey;
    private String studentNumber;
    private String studentName;
    private String studentEmail;
    private String programCode;
    private String programName;
    private String moduleCode;
    private String moduleTitle;
    private String semesterName;
    private Integer academicYear;
    private BigDecimal assessmentAvg;
    private BigDecimal attendanceRate;
    private BigDecimal submissionRate;
    private BigDecimal engagementScore;
    private BigDecimal healthScore;
    private String attentionLevel;
    private OffsetDateTime calculatedAt;

    public AtRiskStudentOlapDto() {}

    public AtRiskStudentOlapDto(UUID factId, UUID studentKey, String studentNumber, String studentName, String studentEmail,
                               String programCode, String programName, String moduleCode, String moduleTitle,
                               String semesterName, Integer academicYear, BigDecimal assessmentAvg, BigDecimal attendanceRate,
                               BigDecimal submissionRate, BigDecimal engagementScore, BigDecimal healthScore,
                               String attentionLevel, OffsetDateTime calculatedAt) {
        this.factId = factId;
        this.studentKey = studentKey;
        this.studentNumber = studentNumber;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.programCode = programCode;
        this.programName = programName;
        this.moduleCode = moduleCode;
        this.moduleTitle = moduleTitle;
        this.semesterName = semesterName;
        this.academicYear = academicYear;
        this.assessmentAvg = assessmentAvg;
        this.attendanceRate = attendanceRate;
        this.submissionRate = submissionRate;
        this.engagementScore = engagementScore;
        this.healthScore = healthScore;
        this.attentionLevel = attentionLevel;
        this.calculatedAt = calculatedAt;
    }

    public UUID getFactId() { return factId; }
    public void setFactId(UUID factId) { this.factId = factId; }

    public UUID getStudentKey() { return studentKey; }
    public void setStudentKey(UUID studentKey) { this.studentKey = studentKey; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getProgramCode() { return programCode; }
    public void setProgramCode(String programCode) { this.programCode = programCode; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }

    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }

    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public BigDecimal getAssessmentAvg() { return assessmentAvg; }
    public void setAssessmentAvg(BigDecimal assessmentAvg) { this.assessmentAvg = assessmentAvg; }

    public BigDecimal getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(BigDecimal attendanceRate) { this.attendanceRate = attendanceRate; }

    public BigDecimal getSubmissionRate() { return submissionRate; }
    public void setSubmissionRate(BigDecimal submissionRate) { this.submissionRate = submissionRate; }

    public BigDecimal getEngagementScore() { return engagementScore; }
    public void setEngagementScore(BigDecimal engagementScore) { this.engagementScore = engagementScore; }

    public BigDecimal getHealthScore() { return healthScore; }
    public void setHealthScore(BigDecimal healthScore) { this.healthScore = healthScore; }

    public String getAttentionLevel() { return attentionLevel; }
    public void setAttentionLevel(String attentionLevel) { this.attentionLevel = attentionLevel; }

    public OffsetDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(OffsetDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
}
