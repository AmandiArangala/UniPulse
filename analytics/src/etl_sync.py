"""
UniPulse Standalone Automated ETL Synchronizer Script (etl_sync.py)
Platform: PostgreSQL 16 / Supabase
Transforms operational OLTP (unipulse_core) -> Star Schema Data Warehouse (unipulse_analytics).
Phase 4: Data Engine & Star Schema ETL Synchronization
"""

import os
import sys
import logging
import argparse
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Tuple
import psycopg2
from psycopg2.extras import execute_values

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [UniPulse ETL Engine] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

class DatabaseETLManager:
    """Automated operational-to-analytical data warehouse ETL pipeline manager."""

    def __init__(self, db_url: str):
        self.db_url = db_url

    def get_connection(self):
        return psycopg2.connect(self.db_url)

    def execute_etl(self, rebuild: bool = False):
        logging.info("Starting UniPulse Data Warehouse ETL Pipeline...")
        conn = self.get_connection()
        conn.autocommit = False
        cursor = conn.cursor()

        try:
            if rebuild:
                logging.warning("Rebuild mode activated. Purging existing unipulse_analytics tables...")
                cursor.execute("TRUNCATE unipulse_analytics.fact_performance CASCADE;")
                cursor.execute("TRUNCATE unipulse_analytics.dim_student CASCADE;")
                cursor.execute("TRUNCATE unipulse_analytics.dim_module CASCADE;")
                cursor.execute("TRUNCATE unipulse_analytics.dim_semester CASCADE;")
                cursor.execute("TRUNCATE unipulse_analytics.dim_program CASCADE;")
                cursor.execute("TRUNCATE unipulse_analytics.dim_date CASCADE;")

            # ------------------------------------------------------------------
            # 1. EXTRACT & LOAD: dim_date
            # ------------------------------------------------------------------
            logging.info("Populating dim_date dimension...")
            date_records = []
            start_d = date(2026, 1, 1)
            end_d = date(2026, 12, 31)
            curr_d = start_d
            while curr_d <= end_d:
                date_records.append((
                    curr_d.strftime("%Y-%m-%d"),
                    curr_d.year,
                    (curr_d.month - 1) // 3 + 1,
                    curr_d.month,
                    curr_d.strftime("%B"),
                    curr_d.day,
                    curr_d.strftime("%A"),
                    curr_d.weekday() in [5, 6],
                    max(1, min(20, (curr_d.timetuple().tm_yday // 7)))
                ))
                curr_d += timedelta(days=1)

            execute_values(
                cursor,
                """
                INSERT INTO unipulse_analytics.dim_date
                (date_key, year, quarter, month, month_name, day, day_of_week, is_weekend, academic_week)
                VALUES %s
                ON CONFLICT (date_key) DO UPDATE SET
                    year = EXCLUDED.year,
                    quarter = EXCLUDED.quarter,
                    month = EXCLUDED.month,
                    month_name = EXCLUDED.month_name,
                    day = EXCLUDED.day,
                    day_of_week = EXCLUDED.day_of_week,
                    is_weekend = EXCLUDED.is_weekend,
                    academic_week = EXCLUDED.academic_week;
                """,
                date_records
            )
            logging.info(f"Synchronized {len(date_records):,} dim_date rows.")

            # ------------------------------------------------------------------
            # 2. EXTRACT & LOAD: dim_program
            # ------------------------------------------------------------------
            logging.info("Extracting programs from unipulse_core...")
            cursor.execute("""
                SELECT 
                    p.id, p.code, p.name, p.degree_level, 
                    d.name AS department_name, f.name AS faculty_name, p.total_credits
                FROM unipulse_core.programs p
                JOIN unipulse_core.departments d ON p.department_id = d.id
                JOIN unipulse_core.faculties f ON d.faculty_id = f.id;
            """)
            prog_rows = cursor.fetchall()

            if prog_rows:
                execute_values(
                    cursor,
                    """
                    INSERT INTO unipulse_analytics.dim_program
                    (program_key, program_code, program_name, degree_level, department_name, faculty_name, total_credits)
                    VALUES %s
                    ON CONFLICT (program_code) DO UPDATE SET
                        program_name = EXCLUDED.program_name,
                        degree_level = EXCLUDED.degree_level,
                        department_name = EXCLUDED.department_name,
                        faculty_name = EXCLUDED.faculty_name,
                        total_credits = EXCLUDED.total_credits;
                    """,
                    prog_rows
                )
            logging.info(f"Synchronized {len(prog_rows):,} dim_program rows.")

            # ------------------------------------------------------------------
            # 3. EXTRACT & LOAD: dim_student
            # ------------------------------------------------------------------
            logging.info("Extracting student profiles from unipulse_core...")
            cursor.execute("""
                SELECT 
                    s.user_id AS student_key,
                    s.student_number,
                    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                    u.email,
                    p.name AS program_name,
                    d.name AS department_name,
                    f.name AS faculty_name,
                    s.enrollment_year,
                    s.gpa AS current_gpa,
                    s.academic_status
                FROM unipulse_core.students s
                JOIN unipulse_core.users u ON s.user_id = u.id
                JOIN unipulse_core.programs p ON s.program_id = p.id
                JOIN unipulse_core.departments d ON p.department_id = d.id
                JOIN unipulse_core.faculties f ON d.faculty_id = f.id;
            """)
            student_rows = cursor.fetchall()

            if student_rows:
                execute_values(
                    cursor,
                    """
                    INSERT INTO unipulse_analytics.dim_student
                    (student_key, student_number, full_name, email, program_name, department_name, faculty_name, enrollment_year, current_gpa, academic_status)
                    VALUES %s
                    ON CONFLICT (student_key) DO UPDATE SET
                        full_name = EXCLUDED.full_name,
                        email = EXCLUDED.email,
                        program_name = EXCLUDED.program_name,
                        department_name = EXCLUDED.department_name,
                        faculty_name = EXCLUDED.faculty_name,
                        current_gpa = EXCLUDED.current_gpa,
                        academic_status = EXCLUDED.academic_status,
                        updated_at = CURRENT_TIMESTAMP;
                    """,
                    student_rows
                )
            logging.info(f"Synchronized {len(student_rows):,} dim_student rows.")

            # ------------------------------------------------------------------
            # 4. EXTRACT & LOAD: dim_module
            # ------------------------------------------------------------------
            logging.info("Extracting modules from unipulse_core...")
            cursor.execute("""
                SELECT 
                    m.id AS module_key,
                    m.code AS module_code,
                    m.title AS module_title,
                    m.credit_hours,
                    d.name AS department_name,
                    f.name AS faculty_name
                FROM unipulse_core.modules m
                JOIN unipulse_core.departments d ON m.department_id = d.id
                JOIN unipulse_core.faculties f ON d.faculty_id = f.id;
            """)
            module_rows = cursor.fetchall()

            if module_rows:
                execute_values(
                    cursor,
                    """
                    INSERT INTO unipulse_analytics.dim_module
                    (module_key, module_code, module_title, credit_hours, department_name, faculty_name)
                    VALUES %s
                    ON CONFLICT (module_key) DO UPDATE SET
                        module_title = EXCLUDED.module_title,
                        credit_hours = EXCLUDED.credit_hours,
                        department_name = EXCLUDED.department_name,
                        faculty_name = EXCLUDED.faculty_name,
                        updated_at = CURRENT_TIMESTAMP;
                    """,
                    module_rows
                )
            logging.info(f"Synchronized {len(module_rows):,} dim_module rows.")

            # ------------------------------------------------------------------
            # 5. EXTRACT & LOAD: dim_semester
            # ------------------------------------------------------------------
            logging.info("Extracting semesters from unipulse_core...")
            cursor.execute("""
                SELECT id AS semester_key, name AS semester_name, academic_year, start_date, end_date, is_current
                FROM unipulse_core.semesters;
            """)
            semester_rows = cursor.fetchall()

            if semester_rows:
                execute_values(
                    cursor,
                    """
                    INSERT INTO unipulse_analytics.dim_semester
                    (semester_key, semester_name, academic_year, start_date, end_date, is_current)
                    VALUES %s
                    ON CONFLICT (semester_key) DO UPDATE SET
                        semester_name = EXCLUDED.semester_name,
                        academic_year = EXCLUDED.academic_year,
                        start_date = EXCLUDED.start_date,
                        end_date = EXCLUDED.end_date,
                        is_current = EXCLUDED.is_current,
                        updated_at = CURRENT_TIMESTAMP;
                    """,
                    semester_rows
                )
            logging.info(f"Synchronized {len(semester_rows):,} dim_semester rows.")

            # ------------------------------------------------------------------
            # 6. TRANSFORM & LOAD: fact_performance Fact Table
            # ------------------------------------------------------------------
            logging.info("Aggregating operational metrics into fact_performance...")
            cursor.execute("""
                WITH attendance_agg AS (
                    SELECT 
                        ar.student_id,
                        ase.module_id,
                        ROUND(
                            (SUM(CASE WHEN ar.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END)::NUMERIC / 
                             GREATEST(COUNT(ar.id), 1)) * 100.0, 2
                        ) AS attendance_rate
                    FROM unipulse_core.attendance_records ar
                    JOIN unipulse_core.attendance_sessions ase ON ar.session_id = ase.id
                    GROUP BY ar.student_id, ase.module_id
                ),
                scores_agg AS (
                    SELECT 
                        res.student_id,
                        ass.module_id,
                        ass.semester_id,
                        ROUND(AVG(res.score_obtained), 2) AS scores,
                        ROUND(
                            (SUM(CASE WHEN res.submitted_at IS NOT NULL OR res.score_obtained > 0 THEN 1 ELSE 0 END)::NUMERIC / 
                             GREATEST(COUNT(res.id), 1)) * 100.0, 2
                        ) AS submission_rate
                    FROM unipulse_core.assessment_results res
                    JOIN unipulse_core.assessments ass ON res.assessment_id = ass.id
                    GROUP BY res.student_id, ass.module_id, ass.semester_id
                ),
                events_agg AS (
                    SELECT 
                        student_id,
                        ROUND(LEAST(100.0, GREATEST(30.0, (COUNT(id)::NUMERIC / 40.0) * 100.0)), 2) AS engagement_score
                    FROM unipulse_core.student_learning_events
                    GROUP BY student_id
                )
                SELECT 
                    gen_random_uuid() AS fact_id,
                    e.student_id AS student_key,
                    e.module_id AS module_key,
                    e.semester_id AS semester_key,
                    s.program_id AS program_key,
                    CURRENT_DATE AS date_key,
                    COALESCE(sc.scores, e.final_grade, 70.00) AS scores,
                    COALESCE(att.attendance_rate, 85.00) AS attendance_rate,
                    COALESCE(sc.submission_rate, 90.00) AS submission_rate,
                    COALESCE(ev.engagement_score, 80.00) AS engagement_score,
                    COALESCE(e.final_grade, sc.scores, 70.00) AS final_grade,
                    ROUND(
                        (0.35 * COALESCE(sc.scores, e.final_grade, 70.00)) +
                        (0.35 * COALESCE(att.attendance_rate, 85.00)) +
                        (0.15 * COALESCE(sc.submission_rate, 90.00)) +
                        (0.15 * COALESCE(ev.engagement_score, 80.00)),
                        2
                    ) AS health_score,
                    CASE 
                        WHEN ROUND(
                            (0.35 * COALESCE(sc.scores, e.final_grade, 70.00)) +
                            (0.35 * COALESCE(att.attendance_rate, 85.00)) +
                            (0.15 * COALESCE(sc.submission_rate, 90.00)) +
                            (0.15 * COALESCE(ev.engagement_score, 80.00)), 2
                        ) >= 80.0 THEN 'EXCELLENT'
                        WHEN ROUND(
                            (0.35 * COALESCE(sc.scores, e.final_grade, 70.00)) +
                            (0.35 * COALESCE(att.attendance_rate, 85.00)) +
                            (0.15 * COALESCE(sc.submission_rate, 90.00)) +
                            (0.15 * COALESCE(ev.engagement_score, 80.00)), 2
                        ) >= 65.0 THEN 'SATISFACTORY'
                        WHEN ROUND(
                            (0.35 * COALESCE(sc.scores, e.final_grade, 70.00)) +
                            (0.35 * COALESCE(att.attendance_rate, 85.00)) +
                            (0.15 * COALESCE(sc.submission_rate, 90.00)) +
                            (0.15 * COALESCE(ev.engagement_score, 80.00)), 2
                        ) >= 50.0 THEN 'ATTENTION_REQUIRED'
                        ELSE 'CRITICAL'
                    END AS attention_level
                FROM unipulse_core.enrollments e
                JOIN unipulse_core.students s ON e.student_id = s.user_id
                LEFT JOIN attendance_agg att ON e.student_id = att.student_id AND e.module_id = att.module_id
                LEFT JOIN scores_agg sc ON e.student_id = sc.student_id AND e.module_id = sc.module_id AND e.semester_id = sc.semester_id
                LEFT JOIN events_agg ev ON e.student_id = ev.student_id;
            """)

            fact_rows = cursor.fetchall()
            if fact_rows:
                execute_values(
                    cursor,
                    """
                    INSERT INTO unipulse_analytics.fact_performance
                    (fact_id, student_key, module_key, semester_key, program_key, date_key, scores, attendance_rate, submission_rate, engagement_score, final_grade, health_score, attention_level)
                    VALUES %s
                    ON CONFLICT (student_key, module_key, semester_key) DO UPDATE SET
                        program_key = EXCLUDED.program_key,
                        date_key = EXCLUDED.date_key,
                        scores = EXCLUDED.scores,
                        attendance_rate = EXCLUDED.attendance_rate,
                        submission_rate = EXCLUDED.submission_rate,
                        engagement_score = EXCLUDED.engagement_score,
                        final_grade = EXCLUDED.final_grade,
                        health_score = EXCLUDED.health_score,
                        attention_level = EXCLUDED.attention_level,
                        updated_at = CURRENT_TIMESTAMP;
                    """,
                    fact_rows
                )
            logging.info(f"Synchronized {len(fact_rows):,} fact_performance rows.")

            conn.commit()
            logging.info("SUCCESS: Data Warehouse ETL Pipeline completed successfully!")

        except Exception as e:
            conn.rollback()
            logging.error(f"ETL Pipeline Execution Failed: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

def main():
    parser = argparse.ArgumentParser(description="UniPulse Automated Data Warehouse ETL Synchronizer")
    parser.add_argument("--db-url", type=str, default=os.getenv("DATABASE_URL", "postgresql://postgres:your_postgres_password@localhost:5432/unipulse_db"))
    parser.add_argument("--rebuild", action="store_true", help="Truncate analytical schema and perform complete rebuild")
    args = parser.parse_args()

    manager = DatabaseETLManager(args.db_url)
    manager.execute_etl(rebuild=args.rebuild)

if __name__ == "__main__":
    main()
