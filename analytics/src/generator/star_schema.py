"""
UniPulse Analytical Star Schema Aggregator & Data Warehouse ETL Engine
Transforms operational OLTP data into dim_student, dim_module, dim_semester, dim_program, dim_date, and fact_performance.
Phase 4: Data Engine & Star Schema Metric Computation Engine.
"""

from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, date, timedelta
from generator.config import GeneratorScale
from generator.utils import generate_uuid

class StarSchemaExporter:
    """ETL Engine mapping operational OLTP entities to OLAP Star Schema tables."""

    def __init__(
        self,
        scale: GeneratorScale,
        faculties: List[Dict[str, Any]],
        departments: List[Dict[str, Any]],
        programs: List[Dict[str, Any]],
        modules: List[Dict[str, Any]],
        semesters: List[Dict[str, Any]],
        users: List[Dict[str, Any]],
        students: List[Dict[str, Any]],
        enrollments: List[Dict[str, Any]],
        attendance_sessions: List[Dict[str, Any]],
        attendance_records: List[Dict[str, Any]],
        assessments: List[Dict[str, Any]],
        assessment_results: List[Dict[str, Any]],
        learning_events: Optional[List[Dict[str, Any]]] = None
    ):
        self.scale = scale
        self.faculties = faculties
        self.departments = departments
        self.programs = programs
        self.modules = modules
        self.semesters = semesters

        self.fac_map = {f["id"]: f["name"] for f in faculties}
        self.dept_map = {d["id"]: d for d in departments}
        self.prog_map = {p["id"]: p for p in programs}
        self.user_map = {u["id"]: u for u in users}
        self.module_map = {m["id"]: m for m in modules}
        self.semester_map = {s["id"]: s for s in semesters}

        self.students = students
        self.enrollments = enrollments
        self.assessments_map = {a["id"]: a for a in assessments}
        self.learning_events = learning_events or []

        # Index attendance by session and group by (student_id, module_id, semester_id)
        self.session_map = {s["id"]: s for s in attendance_sessions}
        
        self.student_mod_attendance: Dict[Tuple[str, str, str], List[str]] = {}
        for r in attendance_records:
            sess = self.session_map.get(r["session_id"])
            if sess:
                key = (r["student_id"], sess["module_id"], self._get_session_semester_id(sess, semesters))
                if key not in self.student_mod_attendance:
                    self.student_mod_attendance[key] = []
                self.student_mod_attendance[key].append(r["status"])

        # Group assessment results by (student_id, module_id, semester_id)
        self.student_mod_results: Dict[Tuple[str, str, str], List[Dict[str, Any]]] = {}
        for res in assessment_results:
            ass = self.assessments_map.get(res["assessment_id"])
            if ass:
                key = (res["student_id"], ass["module_id"], ass["semester_id"])
                if key not in self.student_mod_results:
                    self.student_mod_results[key] = []
                self.student_mod_results[key].append(res)

        # Index student clickstream learning events count by student_id
        self.student_event_counts: Dict[str, int] = {}
        for ev in self.learning_events:
            st_id = ev.get("student_id")
            if st_id:
                self.student_event_counts[st_id] = self.student_event_counts.get(st_id, 0) + 1

        self.dim_dates: List[Dict[str, Any]] = []
        self.dim_programs: List[Dict[str, Any]] = []
        self.dim_students: List[Dict[str, Any]] = []
        self.dim_modules: List[Dict[str, Any]] = []
        self.dim_semesters: List[Dict[str, Any]] = []
        self.fact_performance: List[Dict[str, Any]] = []

    def _get_session_semester_id(self, session: Dict[str, Any], semesters: List[Dict[str, Any]]) -> str:
        s_date = session["session_date"]
        for sem in semesters:
            if sem["start_date"] <= s_date <= sem["end_date"]:
                return sem["id"]
        return semesters[0]["id"] if semesters else ""

    def _generate_dim_date(self) -> None:
        """Populate temporal dim_date records across academic calendar years."""
        start_d = date(2026, 1, 1)
        end_d = date(2026, 12, 31)
        curr_d = start_d

        while curr_d <= end_d:
            acad_week = 1
            for sem in self.semesters:
                s_start = datetime.strptime(str(sem["start_date"]), "%Y-%m-%d").date() if isinstance(sem["start_date"], str) else sem["start_date"]
                s_end = datetime.strptime(str(sem["end_date"]), "%Y-%m-%d").date() if isinstance(sem["end_date"], str) else sem["end_date"]
                if s_start <= curr_d <= s_end:
                    days_diff = (curr_d - s_start).days
                    acad_week = max(1, min(20, (days_diff // 7) + 1))
                    break

            self.dim_dates.append({
                "date_key": curr_d.strftime("%Y-%m-%d"),
                "year": curr_d.year,
                "quarter": (curr_d.month - 1) // 3 + 1,
                "month": curr_d.month,
                "month_name": curr_d.strftime("%B"),
                "day": curr_d.day,
                "day_of_week": curr_d.strftime("%A"),
                "is_weekend": curr_d.weekday() in [5, 6],
                "academic_week": acad_week
            })
            curr_d += timedelta(days=1)

    def _generate_dim_program(self) -> None:
        """Populate dim_program dimension records from academic program structures."""
        for p in self.programs:
            d = self.dept_map.get(p.get("department_id"), {})
            f_name = self.fac_map.get(d.get("faculty_id"), "Faculty of Science & Technology")
            self.dim_programs.append({
                "program_key": p["id"],
                "program_code": p["code"],
                "program_name": p["name"],
                "degree_level": p.get("degree_level", "UNDERGRADUATE"),
                "department_name": d.get("name", "Department of Computer Science"),
                "faculty_name": f_name,
                "total_credits": p.get("total_credits", 120)
            })

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Aggregate operational data into dimension and fact records."""

        # 1. Dimension: dim_date
        self._generate_dim_date()

        # 2. Dimension: dim_program
        self._generate_dim_program()

        # 3. Dimension: dim_student
        for s in self.students:
            u = self.user_map.get(s["user_id"], {})
            p = self.prog_map.get(s["program_id"], {})
            d = self.dept_map.get(p.get("department_id"), {})
            f_name = self.fac_map.get(d.get("faculty_id"), "Faculty of Science & Technology")

            full_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()

            self.dim_students.append({
                "student_key": s["user_id"],
                "student_number": s["student_number"],
                "full_name": full_name,
                "email": u.get("email", f"{s['student_number'].lower()}@unipulse.edu"),
                "program_name": p.get("name", "BSc in Computer Science"),
                "department_name": d.get("name", "Department of Computer Science"),
                "faculty_name": f_name,
                "enrollment_year": s["enrollment_year"],
                "current_gpa": s.get("gpa", 3.20),
                "academic_status": s.get("academic_status", "GOOD_STANDING")
            })

        # 4. Dimension: dim_module
        for m in self.module_map.values():
            d = self.dept_map.get(m["department_id"], {})
            f_name = self.fac_map.get(d.get("faculty_id"), "Faculty of Science & Technology")
            self.dim_modules.append({
                "module_key": m["id"],
                "module_code": m["code"],
                "module_title": m["title"],
                "credit_hours": m["credit_hours"],
                "department_name": d.get("name", "Department of Computer Science"),
                "faculty_name": f_name
            })

        # 5. Dimension: dim_semester
        for sem in self.semester_map.values():
            self.dim_semesters.append({
                "semester_key": sem["id"],
                "semester_name": sem["name"],
                "academic_year": sem["academic_year"],
                "start_date": str(sem.get("start_date", "2026-01-15")),
                "end_date": str(sem.get("end_date", "2026-05-30")),
                "is_current": sem.get("is_current", False)
            })

        # 6. Central Fact Table: fact_performance Metric Computation Engine
        for enr in self.enrollments:
            s_id = enr["student_id"]
            m_id = enr["module_id"]
            sem_id = enr["semester_id"]
            s_obj = next((st for st in self.students if st["user_id"] == s_id), {})
            p_id = s_obj.get("program_id")
            key = (s_id, m_id, sem_id)

            # 6a. Measure: Attendance Rate
            att_statuses = self.student_mod_attendance.get(key, [])
            if att_statuses:
                p_cnt = sum(1 for st in att_statuses if st in ["PRESENT", "LATE"])
                att_rate = round((p_cnt / len(att_statuses)) * 100.0, 2)
            else:
                att_rate = 85.00

            # 6b. Measure: Assessment Score Average & Submission Rate
            ass_res_list = self.student_mod_results.get(key, [])
            if ass_res_list:
                valid_scores = [r["score_obtained"] for r in ass_res_list if r["score_obtained"] is not None]
                submitted_cnt = sum(1 for r in ass_res_list if r["submitted_at"] is not None or r["score_obtained"] > 0)
                
                ass_avg = round(sum(valid_scores) / len(valid_scores), 2) if valid_scores else 70.00
                sub_rate = round((submitted_cnt / len(ass_res_list)) * 100.0, 2)
            else:
                ass_avg = float(enr["final_grade"]) if enr.get("final_grade") is not None else 72.00
                sub_rate = 90.00

            # 6c. Measure: LMS Clickstream Engagement Score
            raw_event_cnt = self.student_event_counts.get(s_id, 0)
            if raw_event_cnt > 0:
                engagement_score = round(min(100.0, max(30.0, (raw_event_cnt / 40.0) * 100.0)), 2)
            else:
                engagement_score = round(min(100.0, max(40.0, (att_rate * 0.5) + (ass_avg * 0.5))), 2)

            # 6d. Measure: Final Grade
            final_grade = float(enr.get("final_grade")) if enr.get("final_grade") is not None else ass_avg

            # 6e. Composite Weighted Academic Health Score Engine
            # Weights: 35% Assessment Avg + 35% Attendance + 15% Submission Rate + 15% Engagement Score
            health_score = round(
                (0.35 * ass_avg) +
                (0.35 * att_rate) +
                (0.15 * sub_rate) +
                (0.15 * engagement_score),
                2
            )

            # 6f. Attention Level Risk Categorization
            if health_score >= 80.0:
                attention_level = "EXCELLENT"
            elif health_score >= 65.0:
                attention_level = "SATISFACTORY"
            elif health_score >= 50.0:
                attention_level = "ATTENTION_REQUIRED"
            else:
                attention_level = "CRITICAL"

            self.fact_performance.append({
                "fact_id": generate_uuid(),
                "student_key": s_id,
                "module_key": m_id,
                "semester_key": sem_id,
                "program_key": p_id,
                "date_key": "2026-03-15",
                "scores": ass_avg,
                "attendance_rate": att_rate,
                "submission_rate": sub_rate,
                "engagement_score": engagement_score,
                "final_grade": final_grade,
                "health_score": health_score,
                "attention_level": attention_level
            })

        return {
            "dim_date": self.dim_dates,
            "dim_program": self.dim_programs,
            "dim_student": self.dim_students,
            "dim_module": self.dim_modules,
            "dim_semester": self.dim_semesters,
            "fact_performance": self.fact_performance
        }
