"""
UniPulse Production Data Engine & Star Schema ETL Pipeline (etl_pipeline.py)
Platform: PostgreSQL 16 / Supabase
Phase 4: Data Engine & Star Schema ETL Pipeline

Leverages Pandas & SQLAlchemy for Extract, Clean, Transform, and Load (ETL) operations,
converting operational OLTP records (unipulse_core) into analytical dimensional tables (unipulse_analytics).

Commit 1: Core ETL Architecture & SQLAlchemy Engine Setup
"""

import os
import sys
import logging
import argparse
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

# Configure production logging system
def setup_logger(log_level: str = "INFO") -> logging.Logger:
    """Configures structured logger for ETL operations."""
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    logger = logging.getLogger("UniPulseETL")
    logger.setLevel(numeric_level)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [ETL Engine] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

class UniPulseETLPipeline:
    """
    Automated Python ETL Pipeline leveraging Pandas and SQLAlchemy.
    Extracts operational data from unipulse_core, applies data cleaning rules,
    computes rolling performance trends & health scores, and bulk loads into unipulse_analytics.
    """

    def __init__(
        self,
        db_url: Optional[str] = None,
        batch_size: int = 5000,
        rebuild: bool = False,
        logger: Optional[logging.Logger] = None
    ):
        self.logger = logger or setup_logger()
        self.batch_size = batch_size
        self.rebuild = rebuild
        
        # Database URL resolution strategy
        resolved_url = (
            db_url or
            os.getenv("DATABASE_URL") or
            "postgresql://postgres:your_postgres_password@localhost:5432/unipulse_db"
        )
        
        # Ensure psycopg2 driver prefix compatibility for SQLAlchemy 2.0+
        if resolved_url.startswith("postgres://"):
            resolved_url = resolved_url.replace("postgres://", "postgresql://", 1)
            
        self.db_url = resolved_url
        self.engine: Optional[Engine] = None
        self._init_sqlalchemy_engine()

    def _init_sqlalchemy_engine(self) -> None:
        """Initializes high-performance SQLAlchemy connection pool with resilience settings."""
        try:
            self.logger.info("Initializing SQLAlchemy database engine connection pool...")
            self.engine = create_engine(
                self.db_url,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=3600,
                future=True
            )
            self.logger.info("SQLAlchemy engine successfully configured.")
        except Exception as err:
            self.logger.error(f"Failed to initialize SQLAlchemy engine: {err}")
            raise

    def test_connection(self) -> bool:
        """Verifies database connectivity and schema presence for unipulse_core and unipulse_analytics."""
        if not self.engine:
            self.logger.error("SQLAlchemy engine is not initialized.")
            return False

        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT current_database(), current_schema();")).fetchone()
                db_name, schema_name = result[0], result[1]
                self.logger.info(f"Connected to Database: '{db_name}' (Current Schema: '{schema_name}')")

                # Verify schema existence
                schemas_query = text("""
                    SELECT schema_name 
                    FROM information_schema.schemata 
                    WHERE schema_name IN ('unipulse_core', 'unipulse_analytics');
                """)
                existing_schemas = [r[0] for r in conn.execute(schemas_query).fetchall()]
                self.logger.info(f"Verified target schemas: {existing_schemas}")
                return True
        except SQLAlchemyError as sqla_err:
            self.logger.error(f"Database connectivity test failed: {sqla_err}")
            return False
        except Exception as err:
            self.logger.error(f"Unexpected error during connection test: {err}")
            return False

    def extract(self) -> Dict[str, pd.DataFrame]:
        """
        Stage 1: Extraction Stage (Extract raw OLTP DataFrames via SQLAlchemy).
        Queries unipulse_core tables: programs, students, modules, semesters, enrollments, assessment_results, attendance_records.
        """
        self.logger.info("[Extract Stage] Querying operational OLTP tables from unipulse_core...")
        extracted_data: Dict[str, pd.DataFrame] = {}

        if not self.engine:
            raise RuntimeError("Cannot execute extract stage: SQLAlchemy engine is not initialized.")

        try:
            with self.engine.connect() as conn:
                # 1. Programs
                prog_sql = """
                    SELECT 
                        p.id AS program_key, p.code AS program_code, p.name AS program_name, 
                        p.degree_level, d.name AS department_name, f.name AS faculty_name, p.total_credits
                    FROM unipulse_core.programs p
                    JOIN unipulse_core.departments d ON p.department_id = d.id
                    JOIN unipulse_core.faculties f ON d.faculty_id = f.id;
                """
                extracted_data["programs"] = pd.read_sql_query(prog_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['programs'])} program records.")

                # 2. Students
                stud_sql = """
                    SELECT 
                        s.user_id AS student_key, s.student_number, 
                        CONCAT(u.first_name, ' ', u.last_name) AS full_name, u.email,
                        p.name AS program_name, d.name AS department_name, f.name AS faculty_name,
                        s.enrollment_year, s.gpa AS current_gpa, s.academic_status
                    FROM unipulse_core.students s
                    JOIN unipulse_core.users u ON s.user_id = u.id
                    JOIN unipulse_core.programs p ON s.program_id = p.id
                    JOIN unipulse_core.departments d ON p.department_id = d.id
                    JOIN unipulse_core.faculties f ON d.faculty_id = f.id;
                """
                extracted_data["students"] = pd.read_sql_query(stud_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['students'])} student profile records.")

                # 3. Modules
                mod_sql = """
                    SELECT 
                        m.id AS module_key, m.code AS module_code, m.title AS module_title, 
                        m.credit_hours, d.name AS department_name, f.name AS faculty_name
                    FROM unipulse_core.modules m
                    JOIN unipulse_core.departments d ON m.department_id = d.id
                    JOIN unipulse_core.faculties f ON d.faculty_id = f.id;
                """
                extracted_data["modules"] = pd.read_sql_query(mod_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['modules'])} module records.")

                # 4. Semesters
                sem_sql = """
                    SELECT 
                        s.id AS semester_key, s.name AS semester_name, s.academic_year, 
                        s.start_date, s.end_date, s.is_current
                    FROM unipulse_core.semesters s;
                """
                extracted_data["semesters"] = pd.read_sql_query(sem_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['semesters'])} semester records.")

                # 5. Enrollments
                enr_sql = """
                    SELECT 
                        e.id AS enrollment_id, e.student_id, e.module_id, e.semester_id, 
                        e.final_grade, e.letter_grade, e.status
                    FROM unipulse_core.enrollments e;
                """
                extracted_data["enrollments"] = pd.read_sql_query(enr_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['enrollments'])} enrollment records.")

                # 6. Assessment Results
                ass_sql = """
                    SELECT 
                        ar.id AS result_id, ar.student_id, ar.assessment_id, ar.score_obtained, 
                        ar.submitted_at, ar.is_late, a.module_id, a.semester_id, 
                        a.weight_percentage, a.max_score, a.due_date
                    FROM unipulse_core.assessment_results ar
                    JOIN unipulse_core.assessments a ON ar.assessment_id = a.id;
                """
                extracted_data["assessment_results"] = pd.read_sql_query(ass_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['assessment_results'])} assessment result records.")

                # 7. Attendance Records
                att_sql = """
                    SELECT 
                        rec.id AS attendance_id, rec.student_id, rec.status, 
                        sess.module_id, sess.session_date
                    FROM unipulse_core.attendance_records rec
                    JOIN unipulse_core.attendance_sessions sess ON rec.session_id = sess.id;
                """
                extracted_data["attendance_records"] = pd.read_sql_query(att_sql, conn)
                self.logger.info(f"  ✓ Extracted {len(extracted_data['attendance_records'])} attendance records.")

        except Exception as err:
            self.logger.error(f"Error during extraction stage: {err}")
            raise

        return extracted_data

    def clean(self, raw_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Stage 2: Data Cleaning & Validation Pipeline (Pandas).
        - Missing value imputation
        - Duplicate detection & removal
        - Out-of-bounds score range filtering [0.0, 100.0]
        - String normalization & GPA bounds enforcement
        """
        self.logger.info("[Clean Stage] Running automated Pandas data cleaning & validation pipeline...")
        cleaned: Dict[str, pd.DataFrame] = {}

        # 1. Clean Programs
        if "programs" in raw_data and not raw_data["programs"].empty:
            df = raw_data["programs"].copy()
            df.drop_duplicates(subset=["program_code"], inplace=True)
            df["program_name"] = df["program_name"].astype(str).str.strip()
            df["total_credits"] = df["total_credits"].fillna(120).astype(int)
            cleaned["programs"] = df

        # 2. Clean Students
        if "students" in raw_data and not raw_data["students"].empty:
            df = raw_data["students"].copy()
            df.drop_duplicates(subset=["student_key"], inplace=True)
            df["full_name"] = df["full_name"].astype(str).str.strip()
            df["email"] = df["email"].fillna("unknown@unipulse.edu")
            df["academic_status"] = df["academic_status"].fillna("GOOD_STANDING").astype(str).str.upper()
            # Enforce GPA bounds [0.00, 4.00]
            df["current_gpa"] = df["current_gpa"].fillna(0.0).clip(lower=0.0, upper=4.0)
            cleaned["students"] = df

        # 3. Clean Modules
        if "modules" in raw_data and not raw_data["modules"].empty:
            df = raw_data["modules"].copy()
            df.drop_duplicates(subset=["module_key"], inplace=True)
            df["module_title"] = df["module_title"].astype(str).str.strip()
            df["credit_hours"] = df["credit_hours"].fillna(3).astype(int)
            cleaned["modules"] = df

        # 4. Clean Semesters
        if "semesters" in raw_data and not raw_data["semesters"].empty:
            df = raw_data["semesters"].copy()
            df.drop_duplicates(subset=["semester_key"], inplace=True)
            df["is_current"] = df["is_current"].fillna(False).astype(bool)
            cleaned["semesters"] = df

        # 5. Clean Enrollments
        if "enrollments" in raw_data and not raw_data["enrollments"].empty:
            df = raw_data["enrollments"].copy()
            df.drop_duplicates(subset=["student_id", "module_id", "semester_id"], inplace=True)
            df["status"] = df["status"].fillna("ENROLLED").astype(str).str.upper()
            if "final_grade" in df.columns:
                df["final_grade"] = pd.to_numeric(df["final_grade"], errors="coerce").clip(lower=0.0, upper=100.0)
            cleaned["enrollments"] = df

        # 6. Clean Assessment Results (Scores Imputation & Bounds Check [0, 100])
        if "assessment_results" in raw_data and not raw_data["assessment_results"].empty:
            df = raw_data["assessment_results"].copy()
            df.drop_duplicates(subset=["student_id", "assessment_id"], inplace=True)
            
            # Numeric conversion & Imputation
            df["max_score"] = pd.to_numeric(df["max_score"], errors="coerce").fillna(100.0)
            df["max_score"] = df["max_score"].apply(lambda x: 100.0 if x <= 0 else x)
            df["score_obtained"] = pd.to_numeric(df["score_obtained"], errors="coerce").fillna(0.0)
            
            # Calculate percentage score normalized to 100
            df["percentage_score"] = (df["score_obtained"] / df["max_score"]) * 100.0
            
            # Filter / clip out-of-bounds invalid score ranges
            initial_count = len(df)
            df["percentage_score"] = df["percentage_score"].clip(lower=0.0, upper=100.0)
            
            df["is_late"] = df["is_late"].fillna(False).astype(bool)
            cleaned["assessment_results"] = df
            self.logger.info(f"  ✓ Cleaned assessment results ({initial_count} valid records, scores normalized & bounded [0, 100]).")

        # 7. Clean Attendance Records
        if "attendance_records" in raw_data and not raw_data["attendance_records"].empty:
            df = raw_data["attendance_records"].copy()
            df.drop_duplicates(subset=["attendance_id"], inplace=True)
            df["status"] = df["status"].fillna("ABSENT").astype(str).str.upper()
            cleaned["attendance_records"] = df
            self.logger.info(f"  ✓ Cleaned attendance records ({len(df)} records).")

        return cleaned

    def transform(self, cleaned_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Stage 3: Feature Engineering & Transformation (Rolling slopes, weighted averages, health score).
        Will be fully implemented in Commit 3.
        """
        self.logger.info("[Transform Stage] Preparing feature engineering & metrics computation...")
        transformed_data: Dict[str, pd.DataFrame] = cleaned_data
        # Stub for Commit 3 implementation
        return transformed_data

    def load(self, transformed_data: Dict[str, pd.DataFrame]) -> bool:
        """
        Stage 4: Bulk Loading & Upsert (Idempotent DW load into unipulse_analytics).
        Will be fully implemented in Commit 4.
        """
        self.logger.info("[Load Stage] Preparing idempotent dimensional DW bulk load...")
        # Stub for Commit 4 implementation
        return True

    def run(self) -> bool:
        """Orchestrates end-to-end execution of the ETL pipeline."""
        self.logger.info("=================================================================")
        self.logger.info(" 🚀 UNIPULSE ETL PIPELINE (Pandas & SQLAlchemy Engine Execution)")
        self.logger.info("=================================================================")
        
        if not self.test_connection():
            self.logger.error("Aborting ETL execution: Database connectivity check failed.")
            return False

        if self.rebuild:
            self.logger.warning("Rebuild flag enabled. Existing analytical tables will be purged before load.")

        try:
            # Step 1: Extract
            raw_data = self.extract()
            
            # Step 2: Clean
            cleaned_data = self.clean(raw_data)
            
            # Step 3: Transform
            transformed_data = self.transform(cleaned_data)
            
            # Step 4: Load
            success = self.load(transformed_data)
            
            self.logger.info("=================================================================")
            self.logger.info(" ✅ ETL PIPELINE COMPLETED SUCCESSFULLY")
            self.logger.info("=================================================================")
            return success
        except Exception as err:
            self.logger.critical(f"ETL pipeline execution failed critically: {err}", exc_info=True)
            return False

def parse_args():
    """CLI argument parser for ETL script execution."""
    parser = argparse.ArgumentParser(
        description="UniPulse Python ETL Pipeline (Pandas & SQLAlchemy Engine)"
    )
    parser.add_argument(
        "--db-url",
        type=str,
        default=None,
        help="Target database connection URL (defaults to DATABASE_URL environment variable)."
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="If set, purges target fact and dimension tables prior to ETL load."
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=5000,
        help="Batch size for bulk insertion operations (default: 5000)."
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Set logging verbosity level (default: INFO)."
    )
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    logger = setup_logger(args.log_level)
    
    pipeline = UniPulseETLPipeline(
        db_url=args.db_url,
        batch_size=args.batch_size,
        rebuild=args.rebuild,
        logger=logger
    )
    
    pipeline.run()
