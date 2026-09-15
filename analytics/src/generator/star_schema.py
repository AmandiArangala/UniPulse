"""
UniPulse Analytical Star Schema Aggregator & Data Warehouse ETL Engine
Transforms operational OLTP data into dim_student, dim_module, dim_semester, and fact_performance.
"""

from typing import List, Dict, Any, Tuple
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
        assessment_results: List[Dict[str, Any]]
    ):
        self.scale = scale
        self.fac_map = {f["id"]: f["name"] for f in faculties}
        self.dept_map = {d["id"]: d for d in departments}
        self.prog_map = {p["id"]: p for p in programs}
        self.user_map = {u["id"]: u for u in users}
        self.module_map = {m["id"]: m for m in modules}
        self.semester_map = {s["id"]: s for s in semesters}

        self.students = students
        self.enrollments = enrollments
        self.assessments_map = {a["id"]: a for a in assessments}

        # Index attendance by (student_id, session_id) and session by session_id
        self.session_map = {s["id"]: s for s in attendance_sessions}
        
        # Group attendance records by (student_id, module_id, semester_id)
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

        self.dim_students: List[Dict[str, Any]] = []
        self.dim_modules: List[Dict[str, Any]] = []
        self.dim_semesters: List[Dict[str, Any]] = []
        self.fact_performance: List[Dict[str, Any]] = []

    def _get_session_semester_id(self, session: Dict[str, Any], semesters: List[Dict[str, Any]]) -> str:
        s_date = session["session_date"]
        for sem in semesters:
            if sem["start_date"] <= s_date <= sem["end_date"]:
                return sem["id"]
        return semesters[0]["id"]

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Aggregate operational data into dimension and fact records."""

        # 1. Dimension: dim_student
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
                "program_name": p.get("name", "BSc in Computer Science"),
                "department_name": d.get("name", "Department of Computer Science"),
                "faculty_name": f_name,
                "enrollment_year": s["enrollment_year"]
            })

        # 2. Dimension: dim_module
        for m in self.module_map.values():
            d = self.dept_map.get(m["department_id"], {})
            self.dim_modules.append({
                "module_key": m["id"],
                "module_code": m["code"],
                "module_title": m["title"],
                "credit_hours": m["credit_hours"],
                "department_name": d.get("name", "Department of Computer Science")
            })

        # 3. Dimension: dim_semester
        for sem in self.semester_map.values():
            self.dim_semesters.append({
                "semester_key": sem["id"],
                "semester_name": sem["name"],
                "academic_year": sem["academic_year"]
            })

        # 4. Fact Table: fact_performance
        for enr in self.enrollments:
            s_id = enr["student_id"]
            m_id = enr["module_id"]
            sem_id = enr["semester_id"]
            key = (s_id, m_id, sem_id)

            # Attendance rate
            att_statuses = self.student_mod_attendance.get(key, [])
            if att_statuses:
                p_cnt = sum(1 for st in att_statuses if st in ["PRESENT", "LATE"])
                att_rate = round((p_cnt / len(att_statuses)) * 100.0, 2)
            else:
                att_rate = 85.00

            # Assessment score average & submission rate
            ass_res_list = self.student_mod_results.get(key, [])
            if ass_res_list:
                valid_scores = [r["score_obtained"] for r in ass_res_list if r["score_obtained"] is not None]
                submitted_cnt = sum(1 for r in ass_res_list if r["submitted_at"] is not None or r["score_obtained"] > 0)
                
                ass_avg = round(sum(valid_scores) / len(valid_scores), 2) if valid_scores else 70.00
                sub_rate = round((submitted_cnt / len(ass_res_list)) * 100.0, 2)
            else:
                ass_avg = enr["final_grade"] if enr["final_grade"] is not None else 72.00
                sub_rate = 90.00

            # Composite Academic Health Score
            health_score = round((0.40 * att_rate) + (0.50 * ass_avg) + (0.10 * sub_rate), 2)

            # Attention Level Categorization
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
                "attendance_rate": att_rate,
                "assessment_avg": ass_avg,
                "submission_rate": sub_rate,
                "academic_health_score": health_score,
                "attention_level": attention_level
            })

        return {
            "dim_student": self.dim_students,
            "dim_module": self.dim_modules,
            "dim_semester": self.dim_semesters,
            "fact_performance": self.fact_performance
        }
