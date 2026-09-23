-- ============================================================================
-- UniPulse Summary Aggregation Schema & Materialized Views (04-summary-analytics-schema.sql)
-- Platform: PostgreSQL 16 / Supabase
-- Phase 4: Data Engine & Star Schema - Day 20 Deliverable
-- Commit 1: Materialized Summary Tables (student_analytics, module_analytics, semester_analytics)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS unipulse_analytics;

SET search_path TO unipulse_analytics, public;

-- ============================================================================
-- 1. MATERIALIZED VIEW: student_analytics
-- Comprehensive student-level performance metrics, score stddev, pass rates, 
-- attendance correlation, and composite health scores.
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS unipulse_analytics.student_analytics CASCADE;

CREATE MATERIALIZED VIEW unipulse_analytics.student_analytics AS
SELECT 
    ds.student_key,
    ds.student_number,
    ds.full_name,
    ds.email,
    ds.program_name,
    ds.department_name,
    ds.faculty_name,
    ds.academic_status,
    ds.current_gpa,
    COUNT(fp.fact_id) AS total_enrolled_modules,
    ROUND(AVG(COALESCE(fp.scores, 0)), 2) AS mean_assessment_score,
    ROUND(COALESCE(STDDEV_SAMP(fp.scores), 0), 2) AS stddev_assessment_score,
    ROUND(AVG(COALESCE(fp.attendance_rate, 0)), 2) AS mean_attendance_rate,
    ROUND(COALESCE(STDDEV_SAMP(fp.attendance_rate), 0), 2) AS stddev_attendance_rate,
    ROUND(AVG(COALESCE(fp.submission_rate, 0)), 2) AS mean_submission_rate,
    ROUND(AVG(COALESCE(fp.health_score, 0)), 2) AS mean_health_score,
    ROUND(COALESCE(CORR(fp.attendance_rate, fp.scores)::numeric, 0.0000), 4) AS attendance_performance_corr,
    SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) AS passed_modules_count,
    ROUND(
        100.0 * SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) / 
        NULLIF(COUNT(fp.fact_id), 0), 
        2
    ) AS pass_rate,
    SUM(CASE WHEN fp.attention_level = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_modules_count,
    SUM(CASE WHEN fp.attention_level = 'ATTENTION_REQUIRED' THEN 1 ELSE 0 END) AS attention_required_modules_count,
    CURRENT_TIMESTAMP AS refreshed_at
FROM unipulse_analytics.dim_student ds
LEFT JOIN unipulse_analytics.fact_performance fp ON ds.student_key = fp.student_key
GROUP BY 
    ds.student_key, 
    ds.student_number, 
    ds.full_name, 
    ds.email, 
    ds.program_name, 
    ds.department_name, 
    ds.faculty_name, 
    ds.academic_status, 
    ds.current_gpa;

COMMENT ON MATERIALIZED VIEW unipulse_analytics.student_analytics IS 'Materialized summary view aggregating individual student analytics, pass rates, score variance, and attendance correlation.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_student_analytics_key ON unipulse_analytics.student_analytics (student_key);
CREATE INDEX IF NOT EXISTS idx_mv_student_analytics_prog ON unipulse_analytics.student_analytics (program_name);
CREATE INDEX IF NOT EXISTS idx_mv_student_analytics_pass_rate ON unipulse_analytics.student_analytics (pass_rate);


-- ============================================================================
-- 2. MATERIALIZED VIEW: module_analytics
-- Course and module level aggregate analytics computing mean, stddev, min/max score,
-- module pass rates, and attendance vs performance correlation coefficient.
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS unipulse_analytics.module_analytics CASCADE;

CREATE MATERIALIZED VIEW unipulse_analytics.module_analytics AS
SELECT 
    dm.module_key,
    dm.module_code,
    dm.module_title,
    dm.credit_hours,
    dm.department_name,
    dm.faculty_name,
    COUNT(DISTINCT fp.student_key) AS total_enrolled_students,
    ROUND(AVG(COALESCE(fp.scores, 0)), 2) AS mean_score,
    ROUND(COALESCE(STDDEV_SAMP(fp.scores), 0), 2) AS stddev_score,
    ROUND(MIN(COALESCE(fp.scores, 0)), 2) AS min_score,
    ROUND(MAX(COALESCE(fp.scores, 0)), 2) AS max_score,
    SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) AS passed_students_count,
    ROUND(
        100.0 * SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) / 
        NULLIF(COUNT(DISTINCT fp.student_key), 0), 
        2
    ) AS pass_rate,
    ROUND(AVG(COALESCE(fp.attendance_rate, 0)), 2) AS mean_attendance_rate,
    ROUND(COALESCE(STDDEV_SAMP(fp.attendance_rate), 0), 2) AS stddev_attendance_rate,
    ROUND(AVG(COALESCE(fp.submission_rate, 0)), 2) AS mean_submission_rate,
    ROUND(COALESCE(CORR(fp.attendance_rate, fp.scores)::numeric, 0.0000), 4) AS attendance_performance_corr,
    ROUND(AVG(COALESCE(fp.health_score, 0)), 2) AS mean_health_score,
    SUM(CASE WHEN fp.attention_level = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_students_count,
    SUM(CASE WHEN fp.attention_level = 'ATTENTION_REQUIRED' THEN 1 ELSE 0 END) AS attention_required_students_count,
    SUM(CASE WHEN fp.attention_level = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_students_count,
    CURRENT_TIMESTAMP AS refreshed_at
FROM unipulse_analytics.dim_module dm
LEFT JOIN unipulse_analytics.fact_performance fp ON dm.module_key = fp.module_key
GROUP BY 
    dm.module_key, 
    dm.module_code, 
    dm.module_title, 
    dm.credit_hours, 
    dm.department_name, 
    dm.faculty_name;

COMMENT ON MATERIALIZED VIEW unipulse_analytics.module_analytics IS 'Materialized module analytics summary with score distributions, standard deviations, pass rates, and attendance correlation.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_module_analytics_key ON unipulse_analytics.module_analytics (module_key);
CREATE INDEX IF NOT EXISTS idx_mv_module_analytics_code ON unipulse_analytics.module_analytics (module_code);
CREATE INDEX IF NOT EXISTS idx_mv_module_analytics_dept ON unipulse_analytics.module_analytics (department_name);


-- ============================================================================
-- 3. MATERIALIZED VIEW: semester_analytics
-- Academic term/semester summary aggregations evaluating macro cohort trends,
-- global pass rates, correlation metrics, and critical student ratios.
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS unipulse_analytics.semester_analytics CASCADE;

CREATE MATERIALIZED VIEW unipulse_analytics.semester_analytics AS
SELECT 
    dsem.semester_key,
    dsem.semester_name,
    dsem.academic_year,
    dsem.start_date,
    dsem.end_date,
    dsem.is_current,
    COUNT(DISTINCT fp.student_key) AS total_enrolled_students,
    COUNT(DISTINCT fp.module_key) AS total_modules_taught,
    COUNT(fp.fact_id) AS total_enrollments,
    ROUND(AVG(COALESCE(fp.scores, 0)), 2) AS mean_score,
    ROUND(COALESCE(STDDEV_SAMP(fp.scores), 0), 2) AS stddev_score,
    ROUND(AVG(COALESCE(fp.attendance_rate, 0)), 2) AS mean_attendance_rate,
    ROUND(COALESCE(STDDEV_SAMP(fp.attendance_rate), 0), 2) AS stddev_attendance_rate,
    ROUND(AVG(COALESCE(fp.submission_rate, 0)), 2) AS mean_submission_rate,
    ROUND(COALESCE(CORR(fp.attendance_rate, fp.scores)::numeric, 0.0000), 4) AS attendance_performance_corr,
    SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) AS passed_enrollments_count,
    ROUND(
        100.0 * SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) / 
        NULLIF(COUNT(fp.fact_id), 0), 
        2
    ) AS overall_pass_rate,
    ROUND(AVG(COALESCE(fp.health_score, 0)), 2) AS mean_health_score,
    SUM(CASE WHEN fp.attention_level = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_students_count,
    ROUND(
        100.0 * SUM(CASE WHEN fp.attention_level = 'CRITICAL' THEN 1 ELSE 0 END) / 
        NULLIF(COUNT(DISTINCT fp.student_key), 0), 
        2
    ) AS critical_students_ratio,
    CURRENT_TIMESTAMP AS refreshed_at
FROM unipulse_analytics.dim_semester dsem
LEFT JOIN unipulse_analytics.fact_performance fp ON dsem.semester_key = fp.semester_key
GROUP BY 
    dsem.semester_key, 
    dsem.semester_name, 
    dsem.academic_year, 
    dsem.start_date, 
    dsem.end_date, 
    dsem.is_current;

COMMENT ON MATERIALIZED VIEW unipulse_analytics.semester_analytics IS 'Materialized semester analytics summary tracking macro academic metrics, total student count, and attendance correlations.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_semester_analytics_key ON unipulse_analytics.semester_analytics (semester_key);
CREATE INDEX IF NOT EXISTS idx_mv_semester_analytics_year ON unipulse_analytics.semester_analytics (academic_year);


-- ============================================================================
-- 4. DYNAMIC SYNCHRONIZATION FUNCTION & STORED PROCEDURE
-- Function to refresh all 3 summary materialized views concurrently.
-- ============================================================================
CREATE OR REPLACE FUNCTION unipulse_analytics.refresh_summary_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY unipulse_analytics.student_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY unipulse_analytics.module_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY unipulse_analytics.semester_analytics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION unipulse_analytics.refresh_summary_analytics() IS 'Concurrently refreshes student_analytics, module_analytics, and semester_analytics materialized summary views.';


-- ============================================================================
-- 5. STANDARD OLAP WRAPPER VIEWS (For direct query access)
-- ============================================================================
CREATE OR REPLACE VIEW unipulse_analytics.vw_student_analytics AS
SELECT * FROM unipulse_analytics.student_analytics;

CREATE OR REPLACE VIEW unipulse_analytics.vw_module_analytics AS
SELECT * FROM unipulse_analytics.module_analytics;

CREATE OR REPLACE VIEW unipulse_analytics.vw_semester_analytics AS
SELECT * FROM unipulse_analytics.semester_analytics;
