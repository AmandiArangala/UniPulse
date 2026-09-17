package com.unipulse.unipulse_backend.analytics.repository;

import com.unipulse.unipulse_backend.analytics.entity.FactPerformanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface FactPerformanceRepository extends JpaRepository<FactPerformanceEntity, UUID> {

    List<FactPerformanceEntity> findByStudentKey(UUID studentKey);

    List<FactPerformanceEntity> findBySemesterKeyAndAttentionLevel(UUID semesterKey, String attentionLevel);

    @Query(value = "SELECT attention_level AS level, COUNT(*) AS cnt FROM unipulse_analytics.fact_performance GROUP BY attention_level", nativeQuery = true)
    List<Map<String, Object>> countByAttentionLevelNative();

    @Query(value = "SELECT AVG(health_score) FROM unipulse_analytics.fact_performance", nativeQuery = true)
    BigDecimal getAverageHealthScore();

    @Query(value = "SELECT AVG(attendance_rate) FROM unipulse_analytics.fact_performance", nativeQuery = true)
    BigDecimal getAverageAttendanceRate();

    @Query(value = "SELECT AVG(scores) FROM unipulse_analytics.fact_performance", nativeQuery = true)
    BigDecimal getAverageAssessmentScore();

    @Query(value = "SELECT AVG(submission_rate) FROM unipulse_analytics.fact_performance", nativeQuery = true)
    BigDecimal getAverageSubmissionRate();

    @Query(value = "SELECT AVG(engagement_score) FROM unipulse_analytics.fact_performance", nativeQuery = true)
    BigDecimal getAverageEngagementScore();

    @Query(value = "SELECT COUNT(DISTINCT student_key) FROM unipulse_analytics.dim_student", nativeQuery = true)
    long countTotalStudents();

    @Query(value = "SELECT COUNT(DISTINCT module_key) FROM unipulse_analytics.dim_module", nativeQuery = true)
    long countTotalModules();

    @Query(value = "SELECT COUNT(DISTINCT semester_key) FROM unipulse_analytics.dim_semester", nativeQuery = true)
    long countTotalSemesters();

    @Query(value = "SELECT COUNT(DISTINCT program_key) FROM unipulse_analytics.dim_program", nativeQuery = true)
    long countTotalPrograms();

    @Query(value = "SELECT * FROM unipulse_analytics.vw_at_risk_students_olap", nativeQuery = true)
    List<Map<String, Object>> findAtRiskStudentsNative();

    @Query(value = "SELECT * FROM unipulse_analytics.vw_program_performance_summary", nativeQuery = true)
    List<Map<String, Object>> findProgramPerformanceSummaryNative();
}
