-- ============================================================================
-- UniPulse Power BI DAX Semantic Compliance & Analytical Views (05-powerbi-semantic-views.sql)
-- Platform: PostgreSQL 16 / Supabase (unipulse_analytics schema)
-- Phase 6: BI Data Modeling & DAX Measures Compliance
-- Commit 2: Extended Warehouse Views and Intervention Metric Extensions
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS unipulse_analytics;

SET search_path TO unipulse_analytics, public;

-- ============================================================================
-- 1. SCHEMA EXTENSION: Ensure intervention tracking columns in fact_performance
-- ============================================================================
ALTER TABLE unipulse_analytics.fact_performance 
ADD COLUMN IF NOT EXISTS intervention_status VARCHAR(50) DEFAULT 'NONE';

ALTER TABLE unipulse_analytics.fact_performance 
ADD COLUMN IF NOT EXISTS intervention_date DATE;

ALTER TABLE unipulse_analytics.fact_performance 
ADD COLUMN IF NOT EXISTS intervention_notes TEXT;

COMMENT ON COLUMN unipulse_analytics.fact_performance.intervention_status IS 'Tracks academic intervention lifecycle status: NONE, PENDING, IN_PROGRESS, SUCCESSFUL, UNRESOLVED';

-- Update sample records with realistic intervention statuses for testing
UPDATE unipulse_analytics.fact_performance 
SET intervention_status = 'SUCCESSFUL',
    intervention_date = CURRENT_DATE - INTERVAL '15 days'
WHERE attention_level IN ('CRITICAL', 'ATTENTION_REQUIRED') 
  AND scores >= 50.0 
  AND (intervention_status IS NULL OR intervention_status = 'NONE');

UPDATE unipulse_analytics.fact_performance 
SET intervention_status = 'IN_PROGRESS',
    intervention_date = CURRENT_DATE - INTERVAL '7 days'
WHERE attention_level IN ('CRITICAL', 'ATTENTION_REQUIRED') 
  AND scores < 50.0 
  AND (intervention_status IS NULL OR intervention_status = 'NONE');

-- ============================================================================
-- 2. STAR SCHEMA DENORMALIZED FACT VIEW: vw_powerbi_fact_performance
-- Supports Power BI DirectQuery and star schema 1-to-many single-directional links
-- ============================================================================
CREATE OR REPLACE VIEW unipulse_analytics.vw_powerbi_fact_performance AS
SELECT 
    fp.fact_id,
    fp.student_key,
    ds.student_number,
    ds.full_name AS student_name,
    ds.current_gpa,
    fp.module_key,
    dm.module_code,
    dm.module_title,
    fp.semester_key,
    dsem.semester_name,
    dsem.academic_year,
    fp.program_key,
    dp.program_code,
    dp.program_name,
    dp.department_name,
    dp.faculty_name,
    fp.date_key,
    fp.scores AS assessment_score,
    fp.attendance_rate,
    fp.submission_rate,
    fp.engagement_score,
    fp.final_grade,
    fp.health_score,
    fp.attention_level,
    fp.intervention_status,
    fp.intervention_date,
    -- DAX Measure Auxiliary Calculated Flags
    CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END AS is_passed,
    CASE WHEN fp.attention_level IN ('CRITICAL', 'ATTENTION_REQUIRED') THEN 1 ELSE 0 END AS is_high_risk,
    CASE WHEN fp.attention_level = 'CRITICAL' THEN 1 ELSE 0 END AS is_critical,
    CASE WHEN fp.intervention_status IN ('SUCCESSFUL', 'RESOLVED') THEN 1 ELSE 0 END AS is_intervention_successful,
    CASE WHEN fp.intervention_status IS NOT NULL AND fp.intervention_status != 'NONE' THEN 1 ELSE 0 END AS has_intervention,
    fp.created_at,
    fp.updated_at
FROM unipulse_analytics.fact_performance fp
JOIN unipulse_analytics.dim_student ds ON fp.student_key = ds.student_key
JOIN unipulse_analytics.dim_module dm ON fp.module_key = dm.module_key
JOIN unipulse_analytics.dim_semester dsem ON fp.semester_key = dsem.semester_key
LEFT JOIN unipulse_analytics.dim_program dp ON fp.program_key = dp.program_key;

COMMENT ON VIEW unipulse_analytics.vw_powerbi_fact_performance IS 'Star Schema view powering Power BI DirectQuery metrics with built-in DAX calculated flags.';

-- ============================================================================
-- 3. DAX EQUIVALENT SUMMARY VIEW: vw_powerbi_dax_summary
-- SQL pre-calculated metrics matching exact Power BI DAX formula logic
-- ============================================================================
CREATE OR REPLACE VIEW unipulse_analytics.vw_powerbi_dax_summary AS
SELECT 
    dsem.semester_name,
    dsem.academic_year,
    COALESCE(dp.faculty_name, 'All Faculties') AS faculty_name,
    COALESCE(dp.department_name, 'All Departments') AS department_name,
    COUNT(DISTINCT fp.student_key) AS total_students,
    COUNT(fp.fact_id) AS total_enrollments,
    
    -- 1. [Avg GPA]
    ROUND(AVG(ds.current_gpa), 2) AS dax_avg_gpa,
    
    -- 2. [Pass Rate %]
    ROUND(
        100.0 * SUM(CASE WHEN COALESCE(fp.final_grade, fp.scores) >= 50.0 THEN 1 ELSE 0 END) / 
        NULLIF(COUNT(fp.fact_id), 0), 
        2
    ) AS dax_pass_rate_pct,
    
    -- 3. [Attendance %]
    ROUND(AVG(COALESCE(fp.attendance_rate, 0)), 2) AS dax_attendance_pct,
    
    -- 4. [High Risk Count]
    COUNT(DISTINCT CASE WHEN fp.attention_level IN ('CRITICAL', 'ATTENTION_REQUIRED') THEN fp.student_key END) AS dax_high_risk_count,
    
    -- 5. [Intervention Success Rate %]
    ROUND(
        100.0 * SUM(CASE WHEN fp.intervention_status IN ('SUCCESSFUL', 'RESOLVED') THEN 1 ELSE 0 END) / 
        NULLIF(SUM(CASE WHEN fp.intervention_status IS NOT NULL AND fp.intervention_status != 'NONE' THEN 1 ELSE 0 END), 0), 
        2
    ) AS dax_intervention_success_rate_pct,
    
    -- 6. [Pearson Correlation r]
    ROUND(COALESCE(CORR(fp.attendance_rate, fp.scores)::numeric, 0.0000), 4) AS dax_pearson_correlation_r,
    
    -- 7. [Academic Health Index]
    ROUND(AVG(COALESCE(fp.health_score, 0)), 2) AS dax_academic_health_index,
    
    -- 8. [Critical Student Count]
    COUNT(DISTINCT CASE WHEN fp.attention_level = 'CRITICAL' THEN fp.student_key END) AS dax_critical_student_count,
    
    -- 9. [Submission Rate %]
    ROUND(AVG(COALESCE(fp.submission_rate, 0)), 2) AS dax_submission_rate_pct,
    
    CURRENT_TIMESTAMP AS calculated_at
FROM unipulse_analytics.fact_performance fp
JOIN unipulse_analytics.dim_student ds ON fp.student_key = ds.student_key
JOIN unipulse_analytics.dim_semester dsem ON fp.semester_key = dsem.semester_key
LEFT JOIN unipulse_analytics.dim_program dp ON fp.program_key = dp.program_key
GROUP BY 
    dsem.semester_name, 
    dsem.academic_year, 
    GROUPING SETS (
        (),
        (dsem.semester_name, dsem.academic_year),
        (dsem.semester_name, dsem.academic_year, dp.faculty_name),
        (dsem.semester_name, dsem.academic_year, dp.faculty_name, dp.department_name)
    );

COMMENT ON VIEW unipulse_analytics.vw_powerbi_dax_summary IS 'SQL view generating exact servercomputed metrics matching the 9 Power BI DAX measures.';
