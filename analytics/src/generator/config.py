"""
UniPulse Synthetic Academic Data Generator - Configuration & Persona Engine
"""

import os
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class GeneratorScale:
    scale_name: str
    num_faculties: int
    num_departments: int
    num_programs: int
    num_modules: int
    num_semesters: int
    num_students: int
    num_lecturers: int
    num_advisors: int
    target_attendance_records: int
    target_assessment_scores: int
    target_jsonb_events: int

SCALE_PRESETS: Dict[str, GeneratorScale] = {
    "sample": GeneratorScale(
        scale_name="SAMPLE (Dev/Testing)",
        num_faculties=2,
        num_departments=4,
        num_programs=5,
        num_modules=20,
        num_semesters=4,
        num_students=500,
        num_lecturers=15,
        num_advisors=5,
        target_attendance_records=25000,
        target_assessment_scores=12000,
        target_jsonb_events=15000
    ),
    "full": GeneratorScale(
        scale_name="FULL (Production Benchmark)",
        num_faculties=4,
        num_departments=8,
        num_programs=10,
        num_modules=80,
        num_semesters=10,
        num_students=5000,
        num_lecturers=50,
        num_advisors=20,
        target_attendance_records=400000,
        target_assessment_scores=150000,
        target_jsonb_events=200000
    )
}

# Persona definitions for realistic score/attendance/clickstream generation
PERSONA_PROFILES: Dict[str, Dict[str, Any]] = {
    "HIGH_ACHIEVER": {
        "weight": 0.15,
        "base_attendance_rate": (0.92, 0.99),
        "base_score_mean": 88.0,
        "base_score_std": 6.0,
        "missed_test_prob": 0.01,
        "decay_factor": 0.005,  # minimal decay over time
        "weekly_events_mean": 40
    },
    "AVERAGE_PERFORMER": {
        "weight": 0.60,
        "base_attendance_rate": (0.75, 0.92),
        "base_score_mean": 74.0,
        "base_score_std": 9.0,
        "missed_test_prob": 0.04,
        "decay_factor": 0.02,
        "weekly_events_mean": 22
    },
    "AT_RISK": {
        "weight": 0.15,
        "base_attendance_rate": (0.50, 0.75),
        "base_score_mean": 58.0,
        "base_score_std": 12.0,
        "missed_test_prob": 0.15,
        "decay_factor": 0.06,  # noticeable drop as semester progresses
        "weekly_events_mean": 10
    },
    "CRITICAL_DISENGAGED": {
        "weight": 0.10,
        "base_attendance_rate": (0.20, 0.50),
        "base_score_mean": 42.0,
        "base_score_std": 14.0,
        "missed_test_prob": 0.35,
        "decay_factor": 0.12,  # severe drop after midterms
        "weekly_events_mean": 3
    }
}

DEFAULT_SEED = 42
DEFAULT_OUTPUT_SQL = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "database", "init", "02-synthetic-seed.sql")
)
