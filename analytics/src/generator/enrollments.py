"""
UniPulse Course Enrollment & Prerequisite Engine
Generates student module enrollments across historical and active semesters.
"""

import random
import numpy as np
from typing import List, Dict, Any, Tuple
from generator.config import GeneratorScale, PERSONA_PROFILES
from generator.utils import generate_uuid

class EnrollmentGenerator:
    """Generates course enrollments mapping students to modules and semesters."""

    GRADE_MAPPINGS = [
        (90.0, 100.0, "A+"),
        (85.0, 89.9, "A"),
        (80.0, 84.9, "A-"),
        (75.0, 79.9, "B+"),
        (70.0, 74.9, "B"),
        (65.0, 69.9, "B-"),
        (60.0, 64.9, "C+"),
        (55.0, 59.9, "C"),
        (50.0, 54.9, "C-"),
        (40.0, 49.9, "D"),
        (0.0, 39.9, "F")
    ]

    def __init__(
        self,
        scale: GeneratorScale,
        students: List[Dict[str, Any]],
        modules: List[Dict[str, Any]],
        semesters: List[Dict[str, Any]],
        programs: List[Dict[str, Any]],
        departments: List[Dict[str, Any]]
    ):
        self.scale = scale
        self.students = students
        self.modules = modules
        self.semesters = sorted(semesters, key=lambda s: s["start_date"])
        self.programs = {p["id"]: p for p in programs}
        self.departments = {d["id"]: d for d in departments}

        # Map department_id -> list of module_ids
        self.dept_modules: Dict[str, List[str]] = {}
        for m in self.modules:
            d_id = m["department_id"]
            if d_id not in self.dept_modules:
                self.dept_modules[d_id] = []
            self.dept_modules[d_id].append(m["id"])

        self.enrollments: List[Dict[str, Any]] = []

    def _score_to_letter_grade(self, score: float) -> str:
        for min_s, max_s, letter in self.GRADE_MAPPINGS:
            if score >= min_s:
                return letter
        return "F"

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate module enrollments for all students across active/past semesters."""

        num_semesters = len(self.semesters)

        for student in self.students:
            s_id = student["user_id"]
            prog_id = student["program_id"]
            persona = student["persona"]
            enr_year = student["enrollment_year"]
            p_config = PERSONA_PROFILES[persona]

            # Find starting semester index based on enrollment year
            start_sem_idx = 0
            for idx, sem in enumerate(self.semesters):
                if sem["academic_year"] == enr_year and "Fall" in sem["name"]:
                    start_sem_idx = idx
                    break

            # Find department modules for the student's program
            dept_id = self.programs[prog_id]["department_id"] if prog_id in self.programs else list(self.dept_modules.keys())[0]
            available_mods = self.dept_modules.get(dept_id, [m["id"] for m in self.modules])
            if not available_mods:
                available_mods = [m["id"] for m in self.modules]

            # Iterate through semesters from start_sem_idx up to current
            for sem_idx in range(start_sem_idx, num_semesters):
                sem = self.semesters[sem_idx]
                is_current = sem["is_current"]

                # Choose 3 to 5 modules for this semester
                mods_count = min(len(available_mods), random.randint(3, 5))
                chosen_mods = random.sample(available_mods, mods_count)

                for mod_id in chosen_mods:
                    enr_id = generate_uuid()

                    if is_current:
                        status = "ENROLLED"
                        final_grade = None
                        letter_grade = None
                    else:
                        # Determine completed grade based on persona mean and std
                        score = float(np.random.normal(p_config["base_score_mean"], p_config["base_score_std"]))
                        score = max(10.0, min(100.0, round(score, 2)))

                        if score < 50.0:
                            status = random.choice(["FAILED", "WITHDRAWN"])
                        else:
                            status = "COMPLETED"

                        final_grade = score
                        letter_grade = self._score_to_letter_grade(score)

                    self.enrollments.append({
                        "id": enr_id,
                        "student_id": s_id,
                        "module_id": mod_id,
                        "semester_id": sem["id"],
                        "final_grade": final_grade,
                        "letter_grade": letter_grade,
                        "status": status,
                        "enrolled_at": sem["start_date"] + "T09:00:00Z"
                    })

        return {"enrollments": self.enrollments}
