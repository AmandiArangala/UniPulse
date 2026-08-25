-- ============================================================================
-- UniPulse Database Migration (V2__create_module_prerequisites.sql)
-- Table for defining course/module prerequisites within unipulse_core schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS unipulse_core.module_prerequisites (
    module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    prerequisite_module_id UUID NOT NULL REFERENCES unipulse_core.modules(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    minimum_grade VARCHAR(5) DEFAULT 'C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (module_id, prerequisite_module_id),
    CONSTRAINT chk_no_self_prerequisite CHECK (module_id <> prerequisite_module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_prerequisites_prereq 
    ON unipulse_core.module_prerequisites(prerequisite_module_id);
