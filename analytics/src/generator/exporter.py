"""
UniPulse Multi-Format Batch SQL Seed Script Exporter Engine
Formats generated operational (OLTP) and analytical (OLAP) data into chunked PostgreSQL 16 / Supabase insert statements.
"""

import os
from typing import List, Dict, Any
from generator.utils import escape_sql_string, format_sql_jsonb, Timer

class SQLExporter:
    """Exports generated in-memory dictionaries into a chunked database/init/02-synthetic-seed.sql file."""

    BATCH_SIZE = 1000

    def __init__(self, output_path: str, data: Dict[str, List[Dict[str, Any]]]):
        self.output_path = output_path
        self.data = data

    def _write_batch_inserts(self, f, table_name: str, columns: List[str], rows: List[Dict[str, Any]], formatter_fn) -> None:
        """Write records in batched multi-row INSERT INTO statements."""
        if not rows:
            return

        f.write(f"\n-- ============================================================================\n")
        f.write(f"-- SEED DATA: {table_name} ({len(rows):,} records)\n")
        f.write(f"-- ============================================================================\n")

        cols_str = ", ".join(columns)
        for i in range(0, len(rows), self.BATCH_SIZE):
            chunk = rows[i:i + self.BATCH_SIZE]
            f.write(f"INSERT INTO {table_name} ({cols_str})\nVALUES\n")
            
            value_tuples = []
            for item in chunk:
                val_str = formatter_fn(item)
                value_tuples.append(f"({val_str})")
            
            f.write(",\n".join(value_tuples))
            f.write("\nON CONFLICT DO NOTHING;\n")

    def export(self) -> str:
        """Execute batch SQL file generation."""

        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)

        with open(self.output_path, "w", encoding="utf-8") as f:
            f.write("-- ============================================================================\n")
            f.write("-- UniPulse Synthetic Academic Dataset Seed Script (02-synthetic-seed.sql)\n")
            f.write("-- Platform: PostgreSQL 16 / Supabase\n")
            f.write("-- Generator: Python Data Engine v1.0.0 (Faker, NumPy, Pandas)\n")
            f.write("-- ============================================================================\n\n")
            f.write("BEGIN;\n\n")

            # 1. Faculties
            self._write_batch_inserts(
                f, "unipulse_core.faculties",
                ["id", "code", "name", "description"],
                self.data.get("faculties", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['code'])}, {escape_sql_string(x['name'])}, {escape_sql_string(x['description'])}"
            )

            # 2. Departments
            self._write_batch_inserts(
                f, "unipulse_core.departments",
                ["id", "faculty_id", "code", "name"],
                self.data.get("departments", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['faculty_id'])}, {escape_sql_string(x['code'])}, {escape_sql_string(x['name'])}"
            )

            # 3. Programs
            self._write_batch_inserts(
                f, "unipulse_core.programs",
                ["id", "department_id", "code", "name", "degree_level", "total_credits"],
                self.data.get("programs", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['department_id'])}, {escape_sql_string(x['code'])}, {escape_sql_string(x['name'])}, {escape_sql_string(x['degree_level'])}, {x['total_credits']}"
            )

            # 4. Modules
            self._write_batch_inserts(
                f, "unipulse_core.modules",
                ["id", "department_id", "code", "title", "credit_hours", "description"],
                self.data.get("modules", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['department_id'])}, {escape_sql_string(x['code'])}, {escape_sql_string(x['title'])}, {x['credit_hours']}, {escape_sql_string(x['description'])}"
            )

            # 5. Prerequisites
            self._write_batch_inserts(
                f, "unipulse_core.module_prerequisites",
                ["module_id", "prerequisite_module_id", "is_mandatory", "minimum_grade"],
                self.data.get("prerequisites", []),
                lambda x: f"{escape_sql_string(x['module_id'])}, {escape_sql_string(x['prerequisite_module_id'])}, {'TRUE' if x['is_mandatory'] else 'FALSE'}, {escape_sql_string(x['minimum_grade'])}"
            )

            # 6. Semesters
            self._write_batch_inserts(
                f, "unipulse_core.semesters",
                ["id", "name", "academic_year", "start_date", "end_date", "is_current"],
                self.data.get("semesters", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['name'])}, {x['academic_year']}, {escape_sql_string(x['start_date'])}, {escape_sql_string(x['end_date'])}, {'TRUE' if x['is_current'] else 'FALSE'}"
            )

            # 7. Users
            self._write_batch_inserts(
                f, "unipulse_core.users",
                ["id", "username", "email", "password_hash", "first_name", "last_name", "role", "is_active"],
                self.data.get("users", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['username'])}, {escape_sql_string(x['email'])}, {escape_sql_string(x['password_hash'])}, {escape_sql_string(x['first_name'])}, {escape_sql_string(x['last_name'])}, {escape_sql_string(x['role'])}, {'TRUE' if x['is_active'] else 'FALSE'}"
            )

            # 8. Lecturers
            self._write_batch_inserts(
                f, "unipulse_core.lecturers",
                ["user_id", "employee_number", "department_id", "academic_title"],
                self.data.get("lecturers", []),
                lambda x: f"{escape_sql_string(x['user_id'])}, {escape_sql_string(x['employee_number'])}, {escape_sql_string(x['department_id'])}, {escape_sql_string(x['academic_title'])}"
            )

            # 9. Advisors
            self._write_batch_inserts(
                f, "unipulse_core.advisors",
                ["user_id", "employee_number", "department_id"],
                self.data.get("advisors", []),
                lambda x: f"{escape_sql_string(x['user_id'])}, {escape_sql_string(x['employee_number'])}, {escape_sql_string(x['department_id'])}"
            )

            # 10. Students
            self._write_batch_inserts(
                f, "unipulse_core.students",
                ["user_id", "student_number", "program_id", "current_semester", "gpa", "academic_status", "enrollment_year"],
                self.data.get("students", []),
                lambda x: f"{escape_sql_string(x['user_id'])}, {escape_sql_string(x['student_number'])}, {escape_sql_string(x['program_id'])}, {x['current_semester']}, {x['gpa']}, {escape_sql_string(x['academic_status'])}, {x['enrollment_year']}"
            )

            # 11. Enrollments
            self._write_batch_inserts(
                f, "unipulse_core.enrollments",
                ["id", "student_id", "module_id", "semester_id", "final_grade", "letter_grade", "status", "enrolled_at"],
                self.data.get("enrollments", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['student_id'])}, {escape_sql_string(x['module_id'])}, {escape_sql_string(x['semester_id'])}, {x['final_grade'] if x['final_grade'] is not None else 'NULL'}, {escape_sql_string(x['letter_grade']) if x['letter_grade'] else 'NULL'}, {escape_sql_string(x['status'])}, {escape_sql_string(x['enrolled_at'])}"
            )

            # 12. Assessments
            self._write_batch_inserts(
                f, "unipulse_core.assessments",
                ["id", "module_id", "semester_id", "title", "type", "weight_percentage", "max_score", "due_date", "is_published"],
                self.data.get("assessments", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['module_id'])}, {escape_sql_string(x['semester_id'])}, {escape_sql_string(x['title'])}, {escape_sql_string(x['type'])}, {x['weight_percentage']}, {x['max_score']}, {escape_sql_string(x['due_date'])}, {'TRUE' if x['is_published'] else 'FALSE'}"
            )

            # 13. Assessment Topics
            self._write_batch_inserts(
                f, "unipulse_core.assessment_topics",
                ["id", "assessment_id", "topic_name", "weight_contribution", "description"],
                self.data.get("topics", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['assessment_id'])}, {escape_sql_string(x['topic_name'])}, {x['weight_contribution']}, {escape_sql_string(x['description'])}"
            )

            # 14. Assessment Results
            self._write_batch_inserts(
                f, "unipulse_core.assessment_results",
                ["id", "assessment_id", "student_id", "score_obtained", "submitted_at", "is_late", "feedback", "file_url", "file_name", "file_size_bytes"],
                self.data.get("assessment_results", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['assessment_id'])}, {escape_sql_string(x['student_id'])}, {x['score_obtained'] if x['score_obtained'] is not None else 'NULL'}, {escape_sql_string(x['submitted_at']) if x['submitted_at'] else 'NULL'}, {'TRUE' if x['is_late'] else 'FALSE'}, {escape_sql_string(x['feedback']) if x['feedback'] else 'NULL'}, {escape_sql_string(x['file_url']) if x['file_url'] else 'NULL'}, {escape_sql_string(x['file_name']) if x['file_name'] else 'NULL'}, {x['file_size_bytes'] if x['file_size_bytes'] else 'NULL'}"
            )

            # 15. Attendance Sessions
            self._write_batch_inserts(
                f, "unipulse_core.attendance_sessions",
                ["id", "module_id", "lecturer_id", "session_date", "topic"],
                self.data.get("attendance_sessions", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['module_id'])}, {escape_sql_string(x['lecturer_id'])}, {escape_sql_string(x['session_date'])}, {escape_sql_string(x['topic'])}"
            )

            # 16. Attendance Records
            self._write_batch_inserts(
                f, "unipulse_core.attendance_records",
                ["id", "session_id", "student_id", "status"],
                self.data.get("attendance_records", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['session_id'])}, {escape_sql_string(x['student_id'])}, {escape_sql_string(x['status'])}"
            )

            # 17. Student Learning Events (JSONB)
            self._write_batch_inserts(
                f, "unipulse_core.student_learning_events",
                ["id", "student_id", "event_type", "event_details", "created_at"],
                self.data.get("student_learning_events", []),
                lambda x: f"{escape_sql_string(x['id'])}, {escape_sql_string(x['student_id'])}, {escape_sql_string(x['event_type'])}, {format_sql_jsonb(x['event_details'])}, {escape_sql_string(x['created_at'])}"
            )

            # 18. Star Schema: dim_student
            self._write_batch_inserts(
                f, "unipulse_analytics.dim_student",
                ["student_key", "student_number", "full_name", "program_name", "department_name", "faculty_name", "enrollment_year"],
                self.data.get("dim_student", []),
                lambda x: f"{escape_sql_string(x['student_key'])}, {escape_sql_string(x['student_number'])}, {escape_sql_string(x['full_name'])}, {escape_sql_string(x['program_name'])}, {escape_sql_string(x['department_name'])}, {escape_sql_string(x['faculty_name'])}, {x['enrollment_year']}"
            )

            # 19. Star Schema: dim_module
            self._write_batch_inserts(
                f, "unipulse_analytics.dim_module",
                ["module_key", "module_code", "module_title", "credit_hours", "department_name"],
                self.data.get("dim_module", []),
                lambda x: f"{escape_sql_string(x['module_key'])}, {escape_sql_string(x['module_code'])}, {escape_sql_string(x['module_title'])}, {x['credit_hours']}, {escape_sql_string(x['department_name'])}"
            )

            # 20. Star Schema: dim_semester
            self._write_batch_inserts(
                f, "unipulse_analytics.dim_semester",
                ["semester_key", "semester_name", "academic_year"],
                self.data.get("dim_semester", []),
                lambda x: f"{escape_sql_string(x['semester_key'])}, {escape_sql_string(x['semester_name'])}, {x['academic_year']}"
            )

            # 21. Star Schema: fact_performance
            self._write_batch_inserts(
                f, "unipulse_analytics.fact_performance",
                ["fact_id", "student_key", "module_key", "semester_key", "attendance_rate", "assessment_avg", "submission_rate", "academic_health_score", "attention_level"],
                self.data.get("fact_performance", []),
                lambda x: f"{escape_sql_string(x['fact_id'])}, {escape_sql_string(x['student_key'])}, {escape_sql_string(x['module_key'])}, {escape_sql_string(x['semester_key'])}, {x['attendance_rate']}, {x['assessment_avg']}, {x['submission_rate']}, {x['academic_health_score']}, {escape_sql_string(x['attention_level'])}"
            )

            f.write("\nCOMMIT;\n")

        return self.output_path
