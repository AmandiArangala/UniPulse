package com.unipulse.unipulse_backend.analytics.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fact_performance", schema = "unipulse_analytics")
public class FactPerformanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "fact_id", nullable = false, updatable = false)
    private UUID factId;

    @Column(name = "student_key", nullable = false)
    private UUID studentKey;

    @Column(name = "module_key", nullable = false)
    private UUID moduleKey;

    @Column(name = "semester_key", nullable = false)
    private UUID semesterKey;

    @Column(name = "program_key")
    private UUID programKey;

    @Column(name = "date_key")
    private LocalDate dateKey;

    @Column(name = "scores", precision = 5, scale = 2)
    private BigDecimal scores;

    @Column(name = "attendance_rate", precision = 5, scale = 2)
    private BigDecimal attendanceRate;

    @Column(name = "submission_rate", precision = 5, scale = 2)
    private BigDecimal submissionRate;

    @Column(name = "engagement_score", precision = 5, scale = 2)
    private BigDecimal engagementScore;

    @Column(name = "final_grade", precision = 5, scale = 2)
    private BigDecimal finalGrade;

    @Column(name = "health_score", precision = 5, scale = 2)
    private BigDecimal healthScore;

    @Column(name = "attention_level", length = 20)
    private String attentionLevel;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public FactPerformanceEntity() {}

    public FactPerformanceEntity(UUID studentKey, UUID moduleKey, UUID semesterKey, UUID programKey,
                                 BigDecimal scores, BigDecimal attendanceRate, BigDecimal submissionRate,
                                 BigDecimal engagementScore, BigDecimal finalGrade, BigDecimal healthScore,
                                 String attentionLevel) {
        this.studentKey = studentKey;
        this.moduleKey = moduleKey;
        this.semesterKey = semesterKey;
        this.programKey = programKey;
        this.scores = scores;
        this.attendanceRate = attendanceRate;
        this.submissionRate = submissionRate;
        this.engagementScore = engagementScore;
        this.finalGrade = finalGrade;
        this.healthScore = healthScore;
        this.attentionLevel = attentionLevel;
    }

    public UUID getFactId() { return factId; }
    public void setFactId(UUID factId) { this.factId = factId; }

    public UUID getStudentKey() { return studentKey; }
    public void setStudentKey(UUID studentKey) { this.studentKey = studentKey; }

    public UUID getModuleKey() { return moduleKey; }
    public void setModuleKey(UUID moduleKey) { this.moduleKey = moduleKey; }

    public UUID getSemesterKey() { return semesterKey; }
    public void setSemesterKey(UUID semesterKey) { this.semesterKey = semesterKey; }

    public UUID getProgramKey() { return programKey; }
    public void setProgramKey(UUID programKey) { this.programKey = programKey; }

    public LocalDate getDateKey() { return dateKey; }
    public void setDateKey(LocalDate dateKey) { this.dateKey = dateKey; }

    public BigDecimal getScores() { return scores; }
    public void setScores(BigDecimal scores) { this.scores = scores; }

    public BigDecimal getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(BigDecimal attendanceRate) { this.attendanceRate = attendanceRate; }

    public BigDecimal getSubmissionRate() { return submissionRate; }
    public void setSubmissionRate(BigDecimal submissionRate) { this.submissionRate = submissionRate; }

    public BigDecimal getEngagementScore() { return engagementScore; }
    public void setEngagementScore(BigDecimal engagementScore) { this.engagementScore = engagementScore; }

    public BigDecimal getFinalGrade() { return finalGrade; }
    public void setFinalGrade(BigDecimal finalGrade) { this.finalGrade = finalGrade; }

    public BigDecimal getHealthScore() { return healthScore; }
    public void setHealthScore(BigDecimal healthScore) { this.healthScore = healthScore; }

    public String getAttentionLevel() { return attentionLevel; }
    public void setAttentionLevel(String attentionLevel) { this.attentionLevel = attentionLevel; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
