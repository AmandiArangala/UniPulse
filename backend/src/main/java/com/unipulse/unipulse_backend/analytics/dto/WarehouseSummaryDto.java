package com.unipulse.unipulse_backend.analytics.dto;

import java.math.BigDecimal;
import java.util.Map;

public class WarehouseSummaryDto {

    private long totalFactRecords;
    private long totalStudents;
    private long totalModules;
    private long totalSemesters;
    private long totalPrograms;
    private BigDecimal averageAcademicHealthScore;
    private BigDecimal averageAttendanceRate;
    private BigDecimal averageAssessmentScore;
    private BigDecimal averageSubmissionRate;
    private BigDecimal averageEngagementScore;
    private Map<String, Long> attentionLevelCounts;

    public WarehouseSummaryDto() {}

    public WarehouseSummaryDto(long totalFactRecords, long totalStudents, long totalModules, long totalSemesters,
                               long totalPrograms, BigDecimal averageAcademicHealthScore, BigDecimal averageAttendanceRate,
                               BigDecimal averageAssessmentScore, BigDecimal averageSubmissionRate,
                               BigDecimal averageEngagementScore, Map<String, Long> attentionLevelCounts) {
        this.totalFactRecords = totalFactRecords;
        this.totalStudents = totalStudents;
        this.totalModules = totalModules;
        this.totalSemesters = totalSemesters;
        this.totalPrograms = totalPrograms;
        this.averageAcademicHealthScore = averageAcademicHealthScore;
        this.averageAttendanceRate = averageAttendanceRate;
        this.averageAssessmentScore = averageAssessmentScore;
        this.averageSubmissionRate = averageSubmissionRate;
        this.averageEngagementScore = averageEngagementScore;
        this.attentionLevelCounts = attentionLevelCounts;
    }

    public long getTotalFactRecords() { return totalFactRecords; }
    public void setTotalFactRecords(long totalFactRecords) { this.totalFactRecords = totalFactRecords; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalModules() { return totalModules; }
    public void setTotalModules(long totalModules) { this.totalModules = totalModules; }

    public long getTotalSemesters() { return totalSemesters; }
    public void setTotalSemesters(long totalSemesters) { this.totalSemesters = totalSemesters; }

    public long getTotalPrograms() { return totalPrograms; }
    public void setTotalPrograms(long totalPrograms) { this.totalPrograms = totalPrograms; }

    public BigDecimal getAverageAcademicHealthScore() { return averageAcademicHealthScore; }
    public void setAverageAcademicHealthScore(BigDecimal averageAcademicHealthScore) { this.averageAcademicHealthScore = averageAcademicHealthScore; }

    public BigDecimal getAverageAttendanceRate() { return averageAttendanceRate; }
    public void setAverageAttendanceRate(BigDecimal averageAttendanceRate) { this.averageAttendanceRate = averageAttendanceRate; }

    public BigDecimal getAverageAssessmentScore() { return averageAssessmentScore; }
    public void setAverageAssessmentScore(BigDecimal averageAssessmentScore) { this.averageAssessmentScore = averageAssessmentScore; }

    public BigDecimal getAverageSubmissionRate() { return averageSubmissionRate; }
    public void setAverageSubmissionRate(BigDecimal averageSubmissionRate) { this.averageSubmissionRate = averageSubmissionRate; }

    public BigDecimal getAverageEngagementScore() { return averageEngagementScore; }
    public void setAverageEngagementScore(BigDecimal averageEngagementScore) { this.averageEngagementScore = averageEngagementScore; }

    public Map<String, Long> getAttentionLevelCounts() { return attentionLevelCounts; }
    public void setAttentionLevelCounts(Map<String, Long> attentionLevelCounts) { this.attentionLevelCounts = attentionLevelCounts; }
}
