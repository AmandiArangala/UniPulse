"""
UniPulse Assessment Score & Academic Anomaly Generator
Generates scaled assessment result records with injected failure spikes and missed test anomalies.
"""

import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from generator.config import GeneratorScale, PERSONA_PROFILES
from generator.utils import generate_uuid

class AssessmentScoresGenerator:
    """Generates realistic student assessment results with academic anomalies."""

    BOTTLENECK_MODULE_CODES = {"CS201", "CS302", "ECE301", "ME201", "FIN301", "SE301", "PSY301"}

    FEEDBACK_POSITIVE = [
        "Excellent analytical rigor and flawless execution.",
        "Great work on problem 3, clear derivation.",
        "Solid conceptual understanding shown throughout.",
        "Outstanding submission with high attention to detail."
    ]
    FEEDBACK_AVERAGE = [
        "Good effort, but minor calculation errors in section B.",
        "Satisfactory response. Review core concepts for the final.",
        "Well structured overall, could improve code readability.",
        "Adequate submission. Pay attention to edge cases."
    ]
    FEEDBACK_NEGATIVE = [
        "Needs significant improvement in core problem solving.",
        "Incomplete solution submitted. Multiple questions unattempted.",
        "Key formulas applied incorrectly. Recommend attending tutoring.",
        "Unsatisfactory submission. Failed to follow assignment guidelines."
    ]

    def __init__(
        self,
        scale: GeneratorScale,
        students: List[Dict[str, Any]],
        enrollments: List[Dict[str, Any]],
        assessments: List[Dict[str, Any]],
        modules: List[Dict[str, Any]]
    ):
        self.scale = scale
        self.students_map = {s["user_id"]: s for s in students}
        self.modules_map = {m["id"]: m for m in modules}
        
        # Group assessments by (module_id, semester_id) and pre-parse due_date objects for high speed
        self.mod_sem_assessments: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
        for a in assessments:
            parsed_a = dict(a)
            parsed_a["due_dt"] = datetime.strptime(a["due_date"], "%Y-%m-%dT%H:%M:%SZ")
            key = (a["module_id"], a["semester_id"])
            if key not in self.mod_sem_assessments:
                self.mod_sem_assessments[key] = []
            self.mod_sem_assessments[key].append(parsed_a)

        self.enrollments = enrollments
        self.results: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate assessment score results with injected academic anomalies."""

        for enr in self.enrollments:
            s_id = enr["student_id"]
            m_id = enr["module_id"]
            sem_id = enr["semester_id"]
            
            student = self.students_map.get(s_id)
            if not student:
                continue

            persona = student["persona"]
            p_config = PERSONA_PROFILES[persona]
            module = self.modules_map.get(m_id)
            is_bottleneck = module["code"] in self.BOTTLENECK_MODULE_CODES if module else False

            target_assessments = self.mod_sem_assessments.get((m_id, sem_id), [])

            for ass in target_assessments:
                due_dt = ass["due_dt"]

                # Anomaly 1: Missed test / zero score spike based on persona
                if random.random() < p_config["missed_test_prob"]:
                    score = 0.00
                    feedback = "MISSED ASSESSMENT: No submission recorded."
                    is_late = False
                    sub_time = None
                    file_url = None
                    file_name = None
                    file_size = None
                else:
                    # Calculate score with normal distribution
                    mean_score = p_config["base_score_mean"]
                    # Anomaly 2: Inject failure spike penalty for bottleneck modules
                    if is_bottleneck and ass["type"] in ["MIDTERM", "FINAL"]:
                        mean_score -= random.uniform(8.0, 14.0)

                    score = float(np.random.normal(mean_score, p_config["base_score_std"]))
                    score = round(max(0.0, min(100.0, score)), 2)

                    # Submission timing and late flag
                    is_late = random.random() < (0.25 if persona in ["AT_RISK", "CRITICAL_DISENGAGED"] else 0.04)
                    sub_dt = due_dt + timedelta(hours=random.randint(1, 48)) if is_late else due_dt - timedelta(hours=random.randint(2, 72))
                    sub_time = sub_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

                    # Feedback feedback string
                    if score >= 80.0:
                        feedback = random.choice(self.FEEDBACK_POSITIVE)
                    elif score >= 60.0:
                        feedback = random.choice(self.FEEDBACK_AVERAGE)
                    else:
                        feedback = random.choice(self.FEEDBACK_NEGATIVE)

                    if is_late:
                        feedback = f"[LATE SUBMISSION] {feedback}"

                    # File details for project / assignment
                    if ass["type"] in ["PROJECT", "ASSIGNMENT"]:
                        file_name = f"{student['student_number']}_{ass['title'].replace(' ', '_').replace(':', '')}.pdf"
                        file_url = f"https://unipulse-storage.supabase.co/v1/object/public/submissions/{file_name}"
                        file_size = random.randint(150000, 4500000)
                    else:
                        file_url, file_name, file_size = None, None, None

                self.results.append({
                    "id": generate_uuid(),
                    "assessment_id": ass["id"],
                    "student_id": s_id,
                    "score_obtained": score,
                    "submitted_at": sub_time,
                    "is_late": is_late,
                    "feedback": feedback,
                    "file_url": file_url,
                    "file_name": file_name,
                    "file_size_bytes": file_size
                })

        return {"assessment_results": self.results}
