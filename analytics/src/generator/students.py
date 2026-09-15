"""
UniPulse Scaled Student Profile Data Generator & Persona Engine
Phase 4: Data Engine & Star Schema
"""

import random
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from faker import Faker
from generator.config import GeneratorScale, PERSONA_PROFILES
from generator.utils import generate_uuid, fake

class StudentGenerator:
    """Generates scaled student user accounts, academic profiles, and persona assignments."""

    DEFAULT_PASSWORD_HASH = "$2a$10$7R0wK/Y1v0qV9.r3/H2v.e2Q9kZq3S.5k/a1.Z2b3c4d5e6f7g8h"

    def __init__(self, scale: GeneratorScale, programs: List[Dict[str, Any]]):
        self.scale = scale
        self.programs = programs
        self.users: List[Dict[str, Any]] = []
        self.students: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate student user auth entries, profiles, and assigned personas."""

        num_students = self.scale.num_students
        prog_ids = [p["id"] for p in self.programs]

        # 1. Persona Assignment (Categorical probability distribution)
        personas = list(PERSONA_PROFILES.keys())
        weights = [PERSONA_PROFILES[p]["weight"] for p in personas]
        assigned_personas = np.random.choice(personas, size=num_students, p=weights)

        # 2. Vectorized Enrollment Years (2021 to 2025)
        enrollment_years = np.random.choice([2021, 2022, 2023, 2024, 2025], size=num_students, p=[0.15, 0.20, 0.25, 0.25, 0.15])

        for idx in range(1, num_students + 1):
            user_id = generate_uuid()
            persona = assigned_personas[idx - 1]
            enr_year = int(enrollment_years[idx - 1])
            
            # Calculate current semester based on enrollment year (Spring 2026 reference)
            years_enrolled = 2026 - enr_year
            current_sem = min(10, max(1, years_enrolled * 2))

            # Assign GPA & Academic Status based on Persona
            if persona == "HIGH_ACHIEVER":
                gpa = round(float(np.random.uniform(3.50, 4.00)), 2)
                academic_status = "GOOD_STANDING"
            elif persona == "AVERAGE_PERFORMER":
                gpa = round(float(np.random.uniform(2.80, 3.49)), 2)
                academic_status = "GOOD_STANDING"
            elif persona == "AT_RISK":
                gpa = round(float(np.random.uniform(2.00, 2.79)), 2)
                academic_status = random.choice(["GOOD_STANDING", "ACADEMIC_WARNING", "PROBATION"])
            else:  # CRITICAL_DISENGAGED
                gpa = round(float(np.random.uniform(1.00, 1.99)), 2)
                academic_status = random.choice(["PROBATION", "CRITICAL_RISK"])

            first_name = fake.first_name()
            last_name = fake.last_name()
            clean_first = first_name.lower().replace("'", "").replace(" ", "")
            clean_last = last_name.lower().replace("'", "").replace(" ", "")
            username = f"std.{clean_first}.{clean_last}{idx}"
            email = f"student.{clean_first}.{clean_last}{idx}@student.unipulse.edu"
            student_num = f"STU-{enr_year}-{idx:04d}"
            prog_id = prog_ids[(idx - 1) % len(prog_ids)]

            self.users.append({
                "id": user_id,
                "username": username,
                "email": email,
                "password_hash": self.DEFAULT_PASSWORD_HASH,
                "first_name": first_name,
                "last_name": last_name,
                "role": "STUDENT",
                "is_active": True
            })

            self.students.append({
                "user_id": user_id,
                "student_number": student_num,
                "program_id": prog_id,
                "current_semester": current_sem,
                "gpa": gpa,
                "academic_status": academic_status,
                "enrollment_year": enr_year,
                "persona": persona  # Retained in-memory for downstream anomaly generation
            })

        return {
            "users": self.users,
            "students": self.students
        }
