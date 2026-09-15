"""
UniPulse Attendance Session & Anomaly Generator
Generates ~400k attendance records with time-decay declining attendance trends and absenteeism spikes.
"""

import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from generator.config import GeneratorScale, PERSONA_PROFILES
from generator.utils import generate_uuid

class AttendanceGenerator:
    """Generates lecture sessions and student attendance records with realistic time-decay anomalies."""

    SESSION_TOPICS = [
        "Course Overview & Syllabus Review",
        "Fundamental Concepts & Case Studies",
        "Theoretical Foundations Part 1",
        "Theoretical Foundations Part 2",
        "Practical Problem Solving & Exercises",
        "Midterm Preparation & Review",
        "Midterm Exam Discussion & Feedback",
        "Advanced Concepts & Real-world Applications",
        "Guest Lecture & Industry Trends",
        "Interactive Lab & Group Workshop",
        "Project Presentations & Critiques",
        "Final Review & Q&A Session"
    ]

    def __init__(
        self,
        scale: GeneratorScale,
        students: List[Dict[str, Any]],
        enrollments: List[Dict[str, Any]],
        modules: List[Dict[str, Any]],
        semesters: List[Dict[str, Any]],
        lecturers: List[Dict[str, Any]]
    ):
        self.scale = scale
        self.students_map = {s["user_id"]: s for s in students}
        self.lecturer_ids = [l["user_id"] for l in lecturers]
        self.semesters = semesters

        # Group enrollments by (module_id, semester_id) -> list of student_ids
        self.mod_sem_students: Dict[Tuple[str, str], List[str]] = {}
        for enr in enrollments:
            key = (enr["module_id"], enr["semester_id"])
            if key not in self.mod_sem_students:
                self.mod_sem_students[key] = []
            self.mod_sem_students[key].append(enr["student_id"])

        self.sessions: List[Dict[str, Any]] = []
        self.records: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate attendance sessions and records with declining attendance anomalies."""

        for sem in self.semesters:
            sem_id = sem["id"]
            start_dt = datetime.strptime(sem["start_date"], "%Y-%m-%d")

            # Iterate over all (module_id, semester_id) pairs with active enrollments
            for (m_id, s_id), student_ids in self.mod_sem_students.items():
                if s_id != sem_id or not student_ids:
                    continue

                lecturer_id = random.choice(self.lecturer_ids) if self.lecturer_ids else generate_uuid()

                # Generate 12 weekly sessions
                for week in range(1, 13):
                    session_id = generate_uuid()
                    session_date = (start_dt + timedelta(weeks=week - 1, days=random.randint(0, 4))).strftime("%Y-%m-%d")
                    topic = self.SESSION_TOPICS[week - 1]

                    self.sessions.append({
                        "id": session_id,
                        "module_id": m_id,
                        "lecturer_id": lecturer_id,
                        "session_date": session_date,
                        "topic": topic
                    })

                    # Generate attendance record for each enrolled student
                    for student_id in student_ids:
                        student = self.students_map.get(student_id)
                        if not student:
                            continue

                        persona = student["persona"]
                        p_config = PERSONA_PROFILES[persona]

                        # Base attendance rate adjusted by semester week decay factor
                        base_min, base_max = p_config["base_attendance_rate"]
                        base_rate = random.uniform(base_min, base_max)

                        # Anomaly: Time decay (attendance drops as semester progresses into late weeks)
                        decay_penalty = (week - 1) * p_config["decay_factor"]
                        effective_rate = max(0.10, base_rate - decay_penalty)

                        # Sample status
                        rand_val = random.random()
                        if rand_val < effective_rate:
                            status = "PRESENT"
                        elif rand_val < effective_rate + 0.08:
                            status = "LATE"
                        elif rand_val < effective_rate + 0.12:
                            status = "EXCUSED"
                        else:
                            status = "ABSENT"

                        self.records.append({
                            "id": generate_uuid(),
                            "session_id": session_id,
                            "student_id": student_id,
                            "status": status
                        })

        return {
            "attendance_sessions": self.sessions,
            "attendance_records": self.records
        }
