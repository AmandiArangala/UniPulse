-- ============================================================================
-- UniPulse Power BI Data Warehouse Semantic Queries (powerbi_star_schema.sql)
-- ============================================================================

-- 1. Student Analytics Semantic View Query
SELECT 
    student_key,
    student_number,
    full_name AS student_name,
    email AS student_email,
    program_name,
    department_name,
    faculty_name,
    academic_status,
    current_gpa,
    total_enrolled_modules,
    mean_assessment_score,
    stddev_assessment_score,
    mean_attendance_rate,
    stddev_attendance_rate,
    mean_submission_rate,
    mean_health_score,
    attendance_performance_corr,
    passed_modules_count,
    pass_rate,
    critical_modules_count,
    attention_required_modules_count,
    refreshed_at
FROM unipulse_analytics.vw_student_analytics;


-- 2. Module Analytics Semantic View Query
SELECT 
    module_key,
    module_code,
    module_title,
    credit_hours,
    department_name,
    faculty_name,
    total_enrolled_students,
    mean_score,
    stddev_score,
    min_score,
    max_score,
    passed_students_count,
    pass_rate,
    mean_attendance_rate,
    stddev_attendance_rate,
    mean_submission_rate,
    attendance_performance_corr,
    mean_health_score,
    critical_students_count,
    attention_required_students_count,
    excellent_students_count,
    refreshed_at
FROM unipulse_analytics.vw_module_analytics;


-- 3. Semester Analytics Semantic View Query
SELECT 
    semester_key,
    semester_name,
    academic_year,
    start_date,
    end_date,
    is_current,
    total_enrolled_students,
    total_modules_taught,
    total_enrollments,
    mean_score,
    stddev_score,
    mean_attendance_rate,
    stddev_attendance_rate,
    mean_submission_rate,
    attendance_performance_corr,
    passed_enrollments_count,
    overall_pass_rate,
    mean_health_score,
    critical_students_count,
    critical_students_ratio,
    refreshed_at
FROM unipulse_analytics.vw_semester_analytics;


/* ============================================================================
   POWER BI DAX MEASURES QUICK REFERENCE
   ============================================================================

   [Mean Score] = AVERAGE(student_analytics[mean_assessment_score])
   [Score StdDev] = STDEV.S(student_analytics[mean_assessment_score])
   [Overall Pass Rate %] = DIVIDE(SUM(student_analytics[passed_modules_count]), SUM(student_analytics[total_enrolled_modules]), 0) * 100
   [Attendance-Performance Pearson r] = 
       VAR AvgAtt = AVERAGE(student_analytics[mean_attendance_rate])
       VAR AvgScore = AVERAGE(student_analytics[mean_assessment_score])
       VAR Numerator = SUMX(student_analytics, (student_analytics[mean_attendance_rate] - AvgAtt) * (student_analytics[mean_assessment_score] - AvgScore))
       VAR Denominator = SQRT(SUMX(student_analytics, (student_analytics[mean_attendance_rate] - AvgAtt)^2) * SUMX(student_analytics, (student_analytics[mean_assessment_score] - AvgScore)^2))
       RETURN DIVIDE(Numerator, Denominator, 0)
   ============================================================================ */
