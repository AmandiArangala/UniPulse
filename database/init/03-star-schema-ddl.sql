-- ============================================================================
-- UniPulse Analytical Data Warehouse DDL (03-star-schema-ddl.sql)
-- Platform: PostgreSQL 16 / Supabase
-- Phase 4: Data Engine & Star Schema
-- Commit 1: Schema Migration for Dimensional Tables
-- ============================================================================

-- Ensure analytical schema exists
CREATE SCHEMA IF NOT EXISTS unipulse_analytics;

SET search_path TO unipulse_analytics, public;

-- ============================================================================
-- 1. DIMENSION TABLE: dim_date (Temporal Dimension for Time Series OLAP)
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

COMMENT ON TABLE unipulse_analytics.dim_date IS 'Temporal date dimension supporting daily, weekly, and semester-level analytics.';

-- Natural key index on date dimension
CREATE INDEX IF NOT EXISTS idx_dim_date_year_month ON unipulse_analytics.dim_date(year, month);
CREATE INDEX IF NOT EXISTS idx_dim_date_academic_week ON unipulse_analytics.dim_date(academic_week);


-- ============================================================================
-- 2. DIMENSION TABLE: dim_program (Degree Program Hierarchy)
-- ============================================================================
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

COMMENT ON TABLE unipulse_analytics.dim_program IS 'Degree program dimension capturing degree levels, departments, and credit requirements.';

CREATE INDEX IF NOT EXISTS idx_dim_program_code ON unipulse_analytics.dim_program(program_code);
CREATE INDEX IF NOT EXISTS idx_dim_program_faculty ON unipulse_analytics.dim_program(faculty_name);


-- ============================================================================
-- 3. DIMENSION TABLE: dim_student (Student Profile & Demographics)
-- ============================================================================
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

-- Ensure table structure alignment if already initialized
ALTER TABLE unipulse_analytics.dim_student ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE unipulse_analytics.dim_student ADD COLUMN IF NOT EXISTS current_gpa NUMERIC(3, 2) DEFAULT 0.00;
ALTER TABLE unipulse_analytics.dim_student ADD COLUMN IF NOT EXISTS academic_status VARCHAR(30) DEFAULT 'GOOD_STANDING';
ALTER TABLE unipulse_analytics.dim_student ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

COMMENT ON TABLE unipulse_analytics.dim_student IS 'Dimensional representation of students enriched with program and faculty details.';

CREATE INDEX IF NOT EXISTS idx_dim_student_number ON unipulse_analytics.dim_student(student_number);
CREATE INDEX IF NOT EXISTS idx_dim_student_program ON unipulse_analytics.dim_student(program_name);


-- ============================================================================
-- 4. DIMENSION TABLE: dim_module (Course / Module Dimension)
-- ============================================================================
CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_module (
    module_key UUID PRIMARY KEY,
    module_code VARCHAR(20) UNIQUE NOT NULL,
    module_title VARCHAR(150) NOT NULL,
    credit_hours INT NOT NULL DEFAULT 3,
    department_name VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure table structure alignment
ALTER TABLE unipulse_analytics.dim_module ADD COLUMN IF NOT EXISTS faculty_name VARCHAR(150);
ALTER TABLE unipulse_analytics.dim_module ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

COMMENT ON TABLE unipulse_analytics.dim_module IS 'Module dimension storing subject area metadata and department alignment.';

CREATE INDEX IF NOT EXISTS idx_dim_module_code ON unipulse_analytics.dim_module(module_code);
CREATE INDEX IF NOT EXISTS idx_dim_module_dept ON unipulse_analytics.dim_module(department_name);


-- ============================================================================
-- 5. DIMENSION TABLE: dim_semester (Academic Calendar / Term Dimension)
-- ============================================================================
CREATE TABLE IF NOT EXISTS unipulse_analytics.dim_semester (
    semester_key UUID PRIMARY KEY,
    semester_name VARCHAR(50) NOT NULL,
    academic_year INT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure table structure alignment
ALTER TABLE unipulse_analytics.dim_semester ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE unipulse_analytics.dim_semester ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE unipulse_analytics.dim_semester ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;
ALTER TABLE unipulse_analytics.dim_semester ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

COMMENT ON TABLE unipulse_analytics.dim_semester IS 'Academic semester dimension for time-bounded cohort aggregation.';

CREATE INDEX IF NOT EXISTS idx_dim_semester_year ON unipulse_analytics.dim_semester(academic_year);


-- ============================================================================
-- 6. CENTRAL FACT TABLE: fact_performance (Academic Performance Fact Table)
-- ============================================================================
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

-- Ensure table structure alignment for existing columns
ALTER TABLE unipulse_analytics.fact_performance ADD COLUMN IF NOT EXISTS program_key UUID REFERENCES unipulse_analytics.dim_program(program_key) ON DELETE CASCADE;
ALTER TABLE unipulse_analytics.fact_performance ADD COLUMN IF NOT EXISTS date_key DATE REFERENCES unipulse_analytics.dim_date(date_key) ON DELETE SET NULL;
ALTER TABLE unipulse_analytics.fact_performance ADD COLUMN IF NOT EXISTS scores NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE unipulse_analytics.fact_performance ADD COLUMN IF NOT EXISTS engagement_score NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE unipulse_analytics.fact_performance ADD COLUMN IF NOT EXISTS final_grade NUMERIC(5, 2);
ALTER TABLE unipulse_analytics.fact_performance ADD COLUMN IF NOT EXISTS health_score NUMERIC(5, 2) DEFAULT 0.00;

COMMENT ON TABLE unipulse_analytics.fact_performance IS 'Central fact table recording student module academic performance metrics, attendance, engagement, and composite health scores.';

-- Foreign key indexes for rapid dimensional joins
CREATE INDEX IF NOT EXISTS idx_fact_perf_student_fk ON unipulse_analytics.fact_performance(student_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_module_fk ON unipulse_analytics.fact_performance(module_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_semester_fk ON unipulse_analytics.fact_performance(semester_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_program_fk ON unipulse_analytics.fact_performance(program_key);
CREATE INDEX IF NOT EXISTS idx_fact_perf_date_fk ON unipulse_analytics.fact_performance(date_key);

