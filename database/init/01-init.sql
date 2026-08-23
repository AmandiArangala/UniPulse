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
    type VARCHAR(30) NOT NULL CHECK (type IN ('ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL', 'PROJECT')),
    weight_percentage NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    due_date TIMESTAMP WITH TIME ZONE
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
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON unipulse_core.attendance_records(student_id);

-- ============================================================================
-- 4. ANALYTICAL STAR SCHEMA TABLES (OLAP / Power BI / Python Analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_student (
    student_key UUID PRIMARY KEY,
    student_number VARCHAR(30),
    full_name VARCHAR(160),
    program_name VARCHAR(150),
    department_name VARCHAR(150),
    faculty_name VARCHAR(150),
    enrollment_year INT
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_module (
    module_key UUID PRIMARY KEY,
    module_code VARCHAR(20),
    module_title VARCHAR(150),
    credit_hours INT,
    department_name VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_semester (
    semester_key UUID PRIMARY KEY,
    semester_name VARCHAR(50),
    academic_year INT
);

CREATE TABLE IF NOT EXISTS unipulse_analytics.fact_performance (
    fact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_key UUID REFERENCES unipulse_analytics.dim_student(student_key),
    module_key UUID REFERENCES unipulse_analytics.dim_module(module_key),
    semester_key UUID REFERENCES unipulse_analytics.dim_semester(semester_key),
    attendance_rate NUMERIC(5, 2),
    assessment_avg NUMERIC(5, 2),
    submission_rate NUMERIC(5, 2),
    academic_health_score NUMERIC(5, 2),
    attention_level VARCHAR(20)
);

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
