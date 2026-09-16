-- ============================================================================
-- UniPulse Database Initialization Script (01-init.sql)
-- Platform: PostgreSQL 16 / Supabase
-- Description: Schema initialization for Operational Data (OLTP) and 
--              Analytical Data (OLAP Star Schema) + JSONB Support.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Create Namespaces / Schemas
CREATE SCHEMA IF NOT EXISTS unipulse_core;
CREATE SCHEMA IF NOT EXISTS unipulse_analytics;

SET search_path TO unipulse_core, public;

-- ============================================================================
-- 3. CORE OPERATIONAL TABLES (OLTP)
-- ============================================================================

-- Faculties
CREATE TABLE IF NOT EXISTS unipulse_core.faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE IF NOT EXISTS unipulse_core.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES unipulse_core.faculties(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Academic Programs
CREATE TABLE IF NOT EXISTS unipulse_core.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES unipulse_core.departments(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    degree_level VARCHAR(50) NOT NULL DEFAULT 'UNDERGRADUATE',
    total_credits INT NOT NULL DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users (Base authentication table for ALL roles)
CREATE TABLE IF NOT EXISTS unipulse_core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students Profile
CREATE TABLE IF NOT EXISTS unipulse_core.students (
    user_id UUID PRIMARY KEY REFERENCES unipulse_core.users(id) ON DELETE CASCADE,
    student_number VARCHAR(30) UNIQUE NOT NULL,
    program_id UUID NOT NULL REFERENCES unipulse_core.programs(id),
    current_semester INT NOT NULL DEFAULT 1,
    gpa NUMERIC(3, 2) DEFAULT 0.00,
    academic_status VARCHAR(30) DEFAULT 'GOOD_STANDING',
    enrollment_year INT NOT NULL
);

-- Lecturers Profile
CREATE TABLE IF NOT EXISTS unipulse_core.lecturers (
    user_id UUID PRIMARY KEY REFERENCES unipulse_core.users(id) ON DELETE CASCADE,
    employee_number VARCHAR(30) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES unipulse_core.departments(id),
    academic_title VARCHAR(50) DEFAULT 'Lecturer'
);

-- Advisors Profile
CREATE TABLE IF NOT EXISTS unipulse_core.advisors (
    user_id UUID PRIMARY KEY REFERENCES unipulse_core.users(id) ON DELETE CASCADE,
    employee_number VARCHAR(30) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES unipulse_core.departments(id)
);

-- Modules / Courses
CREATE TABLE IF NOT EXISTS unipulse_core.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES unipulse_core.departments(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    credit_hours INT NOT NULL DEFAULT 3,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Module Prerequisites
CREATE TABLE IF NOT EXISTS unipulse_core.module_prerequisites (
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    prerequisite_module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    minimum_grade VARCHAR(5) DEFAULT 'C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (module_id, prerequisite_module_id),
    CONSTRAINT chk_no_self_prerequisite CHECK (module_id <> prerequisite_module_id)
);


-- Semesters
CREATE TABLE IF NOT EXISTS unipulse_core.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- e.g., "Fall 2026"
    academic_year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

-- Module Enrollments
CREATE TABLE IF NOT EXISTS unipulse_core.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES unipulse_core.semesters(id),
    final_grade NUMERIC(5, 2),
    letter_grade VARCHAR(5),
    status VARCHAR(20) DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'COMPLETED', 'WITHDRAWN', 'FAILED')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, module_id, semester_id)
);

-- Assessments
CREATE TABLE IF NOT EXISTS unipulse_core.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES unipulse_core.semesters(id),
    title VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL', 'PROJECT', 'PRACTICAL')),
    weight_percentage NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    due_date TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE
);

-- Assessment Topics (Granular topic tags for diagnostic analysis)
CREATE TABLE IF NOT EXISTS unipulse_core.assessment_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES unipulse_core.assessments(id) ON DELETE CASCADE,
    topic_name VARCHAR(150) NOT NULL,
    weight_contribution NUMERIC(5, 2),
    description TEXT
);

-- Assessment Results (Includes Supabase File Storage link)
CREATE TABLE IF NOT EXISTS unipulse_core.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES unipulse_core.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    score_obtained NUMERIC(5, 2),
    submitted_at TIMESTAMP WITH TIME ZONE,
    is_late BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    file_url VARCHAR(512),
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    UNIQUE(assessment_id, student_id)
);

-- Attendance Sessions
CREATE TABLE IF NOT EXISTS unipulse_core.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    lecturer_id UUID NOT NULL REFERENCES unipulse_core.lecturers(user_id),
    session_date DATE NOT NULL,
    topic VARCHAR(150)
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS unipulse_core.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES unipulse_core.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    UNIQUE(session_id, student_id)
);

-- Academic Interventions
CREATE TABLE IF NOT EXISTS unipulse_core.academic_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES unipulse_core.users(id),
    module_id UUID REFERENCES unipulse_core.modules(id),
    reason TEXT NOT NULL,
    intervention_type VARCHAR(50) NOT NULL, -- Consultation, Tutoring, Advising, etc.
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Realtime Notifications Table
CREATE TABLE IF NOT EXISTS unipulse_core.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES unipulse_core.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'GENERAL' CHECK (type IN ('GENERAL', 'ATTENTION_ALERT', 'INTERVENTION', 'GRADE_RELEASED', 'ASSESSMENT_DUE')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- JSONB Semi-Structured Table for Learning Events & Clickstream
CREATE TABLE IF NOT EXISTS unipulse_core.student_learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing JSONB data for performance
CREATE INDEX IF NOT EXISTS idx_learning_events_jsonb ON unipulse_core.student_learning_events USING gin (event_details);
CREATE INDEX IF NOT EXISTS idx_assessment_results_student ON unipulse_core.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_topics_assessment ON unipulse_core.assessment_topics(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON unipulse_core.attendance_records(student_id);

-- ============================================================================
-- 4. ANALYTICAL STAR SCHEMA TABLES (OLAP / Power BI / Python Analytics)
-- (Detailed DDL extended in 03-star-schema-ddl.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_date (
    date_key DATE PRIMARY KEY,
    year INT NOT NULL,
    quarter INT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    month_name VARCHAR(15) NOT NULL,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 31),
    day_of_week VARCHAR(15) NOT NULL,
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE,
    academic_week INT CHECK (academic_week BETWEEN 1 AND 20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_program (
    program_key UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code VARCHAR(20) UNIQUE NOT NULL,
    program_name VARCHAR(150) NOT NULL,
    degree_level VARCHAR(50) NOT NULL DEFAULT 'UNDERGRADUATE',
    department_name VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    total_credits INT NOT NULL DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_student (
    student_key UUID PRIMARY KEY,
    student_number VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(150),
    program_name VARCHAR(150),
    department_name VARCHAR(150),
    faculty_name VARCHAR(150),
    enrollment_year INT NOT NULL,
    current_gpa NUMERIC(3, 2) DEFAULT 0.00,
    academic_status VARCHAR(30) DEFAULT 'GOOD_STANDING',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_module (
    module_key UUID PRIMARY KEY,
    module_code VARCHAR(20) UNIQUE NOT NULL,
    module_title VARCHAR(150) NOT NULL,
    credit_hours INT NOT NULL DEFAULT 3,
    department_name VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_semester (
    semester_key UUID PRIMARY KEY,
    semester_name VARCHAR(50) NOT NULL,
    academic_year INT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.fact_performance (
    fact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_key UUID NOT NULL REFERENCES unipulse_analytics.dim_student(student_key) ON DELETE CASCADE,
    module_key UUID NOT NULL REFERENCES unipulse_analytics.dim_module(module_key) ON DELETE CASCADE,
    semester_key UUID NOT NULL REFERENCES unipulse_analytics.dim_semester(semester_key) ON DELETE CASCADE,
    program_key UUID REFERENCES unipulse_analytics.dim_program(program_key) ON DELETE CASCADE,
    date_key DATE REFERENCES unipulse_analytics.dim_date(date_key) ON DELETE SET NULL,
    scores NUMERIC(5, 2) DEFAULT 0.00,
    attendance_rate NUMERIC(5, 2) DEFAULT 0.00,
    submission_rate NUMERIC(5, 2) DEFAULT 0.00,
    engagement_score NUMERIC(5, 2) DEFAULT 0.00,
    final_grade NUMERIC(5, 2),
    health_score NUMERIC(5, 2) DEFAULT 0.00,
    attention_level VARCHAR(20) DEFAULT 'SATISFACTORY' CHECK (attention_level IN ('EXCELLENT', 'SATISFACTORY', 'ATTENTION_REQUIRED', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_key, module_key, semester_key)
);

-- Foreign key indexes for rapid dimensional joins
CREATE INDEX IF NOT EXISTS idx_fact_perf_student_fk ON unipulse_analytics.fact_performance(student_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_module_fk ON unipulse_analytics.fact_performance(module_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_semester_fk ON unipulse_analytics.fact_performance(semester_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_program_fk ON unipulse_analytics.fact_performance(program_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_date_fk ON unipulse_analytics.fact_performance(date_key);

-- High-Speed OLAP Compound Indexes
CREATE INDEX IF NOT EXISTS idx_fact_perf_sem_prog_health ON unipulse_analytics.fact_performance (semester_key, program_key, health_score);
CREATE INDEX IF NOT EXISTS idx_fact_perf_student_module ON unipulse_analytics.fact_performance (student_key, module_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_date_health ON unipulse_analytics.fact_performance (date_key, health_score DESC);
CREATE INDEX IF NOT EXISTS idx_fact_perf_attention ON unipulse_analytics.fact_performance (attention_level, health_score);

-- Views
CREATE OR REPLACE VIEW unipulse_analytics.vw_at_risk_students_olap AS
SELECT 
    fp.fact_id,
    ds.student_key,
    ds.student_number,
    ds.full_name AS student_name,
    ds.email AS student_email,
    dp.program_code,
    dp.program_name,
    dm.module_code,
    dm.module_title,
    dsem.semester_name,
    dsem.academic_year,
    fp.scores AS assessment_avg,
    fp.attendance_rate,
    fp.submission_rate,
    fp.engagement_score,
    fp.health_score,
    fp.attention_level,
    fp.updated_at AS calculated_at
FROM unipulse_analytics.fact_performance fp
JOIN unipulse_analytics.dim_student ds ON fp.student_key = ds.student_key
JOIN unipulse_analytics.dim_module dm ON fp.module_key = dm.module_key
JOIN unipulse_analytics.dim_semester dsem ON fp.semester_key = dsem.semester_key
LEFT JOIN unipulse_analytics.dim_program dp ON fp.program_key = dp.program_key
WHERE fp.attention_level IN ('CRITICAL', 'ATTENTION_REQUIRED');

CREATE OR REPLACE VIEW unipulse_analytics.vw_program_performance_summary AS
SELECT 
    dp.program_code,
    dp.program_name,
    dp.degree_level,
    dp.faculty_name,
    dsem.semester_name,
    dsem.academic_year,
    COUNT(DISTINCT fp.student_key) AS total_enrolled_students,
    COUNT(DISTINCT fp.module_key) AS total_modules_taught,
    ROUND(AVG(fp.scores), 2) AS avg_assessment_score,
    ROUND(AVG(fp.attendance_rate), 2) AS avg_attendance_rate,
    ROUND(AVG(fp.submission_rate), 2) AS avg_submission_rate,
    ROUND(AVG(fp.engagement_score), 2) AS avg_engagement_score,
    ROUND(AVG(fp.health_score), 2) AS avg_academic_health_score,
    SUM(CASE WHEN fp.attention_level = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_students_count,
    SUM(CASE WHEN fp.attention_level = 'ATTENTION_REQUIRED' THEN 1 ELSE 0 END) AS attention_required_students_count,
    SUM(CASE WHEN fp.attention_level = 'EXCELLENT' THEN 1 ELSE 0 END) AS excellent_students_count
FROM unipulse_analytics.fact_performance fp
JOIN unipulse_analytics.dim_semester dsem ON fp.semester_key = dsem.semester_key
LEFT JOIN unipulse_analytics.dim_program dp ON fp.program_key = dp.program_key
GROUP BY dp.program_code, dp.program_name, dp.degree_level, dp.faculty_name, dsem.semester_name, dsem.academic_year;

-- ============================================================================
-- 5. INITIAL METADATA SEEDING
-- ============================================================================

INSERT INTO unipulse_core.faculties (code, name, description)
VALUES ('FST', 'Faculty of Science and Technology', 'Computer Science, Software Engineering, and Data Science')
ON CONFLICT (code) DO NOTHING;

INSERT INTO unipulse_core.departments (faculty_id, code, name)
SELECT id, 'CS', 'Department of Computer Science'
FROM unipulse_core.faculties WHERE code = 'FST'
ON CONFLICT (code) DO NOTHING;

INSERT INTO unipulse_core.programs (department_id, code, name, total_credits)
SELECT id, 'BS-SE', 'BSc in Software Engineering', 120
FROM unipulse_core.departments WHERE code = 'CS'
ON CONFLICT (code) DO NOTHING;
