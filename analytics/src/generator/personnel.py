"""
UniPulse Personnel & User Auth Account Generator
System Admins, Lecturers, and Academic Advisors
"""

import random
from typing import List, Dict, Any, Tuple
from faker import Faker
from generator.config import GeneratorScale
from generator.utils import generate_uuid, fake

class PersonnelGenerator:
    """Generates system admins, lecturers, and academic advisors with user profiles."""

    ACADEMIC_TITLES = [
        "Assistant Professor",
        "Associate Professor",
        "Senior Lecturer",
        "Professor",
        "Lecturer"
    ]

    DEFAULT_PASSWORD_HASH = "$2a$10$7R0wK/Y1v0qV9.r3/H2v.e2Q9kZq3S.5k/a1.Z2b3c4d5e6f7g8h"  # Standard bcrypt hash for "Password123!"

    def __init__(self, scale: GeneratorScale, departments: List[Dict[str, Any]]):
        self.scale = scale
        self.departments = departments
        self.users: List[Dict[str, Any]] = []
        self.lecturers: List[Dict[str, Any]] = []
        self.advisors: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate admins, lecturers, and advisors."""

        # 1. System Admins (2 default admins)
        admin_names = [("System", "Admin"), ("Super", "Administrator")]
        for idx, (first_name, last_name) in enumerate(admin_names, 1):
            user_id = generate_uuid()
            username = f"admin{idx}"
            email = f"admin{idx}@unipulse.edu"
            self.users.append({
                "id": user_id,
                "username": username,
                "email": email,
                "password_hash": self.DEFAULT_PASSWORD_HASH,
                "first_name": first_name,
                "last_name": last_name,
                "role": "ADMIN",
                "is_active": True
            })

        # 2. Lecturers
        dept_ids = [d["id"] for d in self.departments]
        for idx in range(1, self.scale.num_lecturers + 1):
            user_id = generate_uuid()
            first_name = fake.first_name()
            last_name = fake.last_name()
            clean_first = first_name.lower().replace("'", "").replace(" ", "")
            clean_last = last_name.lower().replace("'", "").replace(" ", "")
            username = f"lec.{clean_first}.{clean_last}{idx}"
            email = f"{clean_first}.{clean_last}@unipulse.edu"
            emp_number = f"LEC-{2020 + (idx % 6)}-{idx:03d}"
            dept_id = dept_ids[(idx - 1) % len(dept_ids)]
            title = random.choice(self.ACADEMIC_TITLES)

            self.users.append({
                "id": user_id,
                "username": username,
                "email": email,
                "password_hash": self.DEFAULT_PASSWORD_HASH,
                "first_name": first_name,
                "last_name": last_name,
                "role": "LECTURER",
                "is_active": True
            })

            self.lecturers.append({
                "user_id": user_id,
                "employee_number": emp_number,
                "department_id": dept_id,
                "academic_title": title
            })

        # 3. Academic Advisors
        for idx in range(1, self.scale.num_advisors + 1):
            user_id = generate_uuid()
            first_name = fake.first_name()
            last_name = fake.last_name()
            clean_first = first_name.lower().replace("'", "").replace(" ", "")
            clean_last = last_name.lower().replace("'", "").replace(" ", "")
            username = f"adv.{clean_first}.{clean_last}{idx}"
            email = f"advisor.{clean_first}.{clean_last}@unipulse.edu"
            emp_number = f"ADV-{2021 + (idx % 5)}-{idx:03d}"
            dept_id = dept_ids[(idx - 1) % len(dept_ids)]

            self.users.append({
                "id": user_id,
                "username": username,
                "email": email,
                "password_hash": self.DEFAULT_PASSWORD_HASH,
                "first_name": first_name,
                "last_name": last_name,
                "role": "ADVISOR",
                "is_active": True
            })

            self.advisors.append({
                "user_id": user_id,
                "employee_number": emp_number,
                "department_id": dept_id
            })

        return {
            "users": self.users,
            "lecturers": self.lecturers,
            "advisors": self.advisors
        }
