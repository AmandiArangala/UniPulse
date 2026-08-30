-- ============================================================================
-- UniPulse Database Migration (V3__create_attendance_and_learning_events.sql)
-- Tables for Attendance Sessions, Attendance Records, and JSONB Learning Behavioral Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS unipulse_core.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    lecturer_id UUID NOT NULL REFERENCES unipulse_core.lecturers(user_id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    topic VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_module_date 
    ON unipulse_core.attendance_sessions(module_id, session_date);

CREATE TABLE IF NOT EXISTS unipulse_core.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES unipulse_core.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student 
    ON unipulse_core.attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_session 
    ON unipulse_core.attendance_records(session_id);

CREATE TABLE IF NOT EXISTS unipulse_core.learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES unipulse_core.students(user_id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learning_events_student_module 
    ON unipulse_core.learning_events(student_id, module_id);

CREATE INDEX IF NOT EXISTS idx_learning_events_type_timestamp 
    ON unipulse_core.learning_events(event_type, timestamp);

CREATE INDEX IF NOT EXISTS idx_learning_events_payload_gin 
    ON unipulse_core.learning_events USING gin (payload);
