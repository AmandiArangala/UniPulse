"""
UniPulse Synthetic Academic Data Generator CLI Orchestrator
Phase 4: Data Engine & Star Schema Engine
"""

import sys
import argparse
from typing import Dict, Any

from generator.config import SCALE_PRESETS, DEFAULT_SEED, DEFAULT_OUTPUT_SQL
from generator.utils import seed_everything, Timer
from generator.academic import AcademicStructureGenerator
from generator.personnel import PersonnelGenerator
from generator.students import StudentGenerator
from generator.enrollments import EnrollmentGenerator
from generator.assessments import AssessmentStructureGenerator
from generator.scores import AssessmentScoresGenerator
from generator.attendance import AttendanceGenerator
from generator.events import LearningEventsGenerator

def parse_args():
    parser = argparse.ArgumentParser(description="UniPulse Synthetic Academic Data Generator")
    parser.add_argument(
        "--scale",
        type=str,
        choices=["sample", "full"],
        default="sample",
        help="Data scaling preset: 'sample' (fast dev testing) or 'full' (5k students, 400k attendance, 150k scores, 200k JSONB)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_SEED,
        help=f"Random seed for generation reproducibility (default: {DEFAULT_SEED})"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=DEFAULT_OUTPUT_SQL,
        help="Target SQL seed output path"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print verbose generation steps"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    scale_cfg = SCALE_PRESETS[args.scale]
    
    print("=" * 70)
    print(f"[UniPulse] Synthetic Data Engine v1.0.0")
    print(f"Target Scale: {scale_cfg.scale_name}")
    print(f"Random Seed : {args.seed}")
    print(f"Output File : {args.output}")
    print("=" * 70)

    seed_everything(args.seed)

    with Timer("Data Generation Pipeline"):
        print(f"[Core Setup] Target: {scale_cfg.num_students} Students, {scale_cfg.num_modules} Modules, {scale_cfg.num_semesters} Semesters")
        
        # 1. Academic Catalog Structure
        academic_gen = AcademicStructureGenerator(scale_cfg)
        academic_data = academic_gen.generate()
        print(f"[Academic Data] Generated {len(academic_data['faculties'])} Faculties, {len(academic_data['departments'])} Departments, {len(academic_data['programs'])} Programs, {len(academic_data['modules'])} Modules, {len(academic_data['prerequisites'])} Prerequisites, {len(academic_data['semesters'])} Semesters.")

        # 2. Personnel Accounts (Admins, Lecturers, Advisors)
        personnel_gen = PersonnelGenerator(scale_cfg, academic_data["departments"])
        personnel_data = personnel_gen.generate()
        print(f"[Personnel Data] Generated {len(personnel_data['lecturers'])} Lecturers, {len(personnel_data['advisors'])} Academic Advisors, and {len(personnel_data['users'])} Personnel User Accounts.")

        # 3. Scaled Students (Users & Profiles)
        student_gen = StudentGenerator(scale_cfg, academic_data["programs"])
        student_data = student_gen.generate()
        total_users = len(personnel_data["users"]) + len(student_data["users"])
        
        # Persona counts summary
        persona_counts = {}
        for s in student_data["students"]:
            p_key = str(s["persona"])
            persona_counts[p_key] = persona_counts.get(p_key, 0) + 1

        print(f"[Student Data] Generated {len(student_data['students']):,} Student Profiles (Personas: {persona_counts}).")
        print(f"[System Users] Total Auth Users: {total_users:,}.")

        # 4. Course Enrollments
        enrollment_gen = EnrollmentGenerator(
            scale_cfg,
            student_data["students"],
            academic_data["modules"],
            academic_data["semesters"],
            academic_data["programs"],
            academic_data["departments"]
        )
        enrollment_data = enrollment_gen.generate()
        enr_statuses = {}
        for e in enrollment_data["enrollments"]:
            st = e["status"]
            enr_statuses[st] = enr_statuses.get(st, 0) + 1
        print(f"[Enrollment Data] Generated {len(enrollment_data['enrollments']):,} Module Enrollments (Breakdown: {enr_statuses}).")

        # 5. Assessment Suites & Diagnostic Topics
        assessment_gen = AssessmentStructureGenerator(
            scale_cfg,
            academic_data["modules"],
            academic_data["semesters"],
            academic_data["departments"]
        )
        assessment_data = assessment_gen.generate()
        print(f"[Assessment Data] Generated {len(assessment_data['assessments']):,} Assessment Suites & {len(assessment_data['topics']):,} Diagnostic Topic Tags.")

        # 6. Assessment Scores & Anomalies (~150k target)
        scores_gen = AssessmentScoresGenerator(
            scale_cfg,
            student_data["students"],
            enrollment_data["enrollments"],
            assessment_data["assessments"],
            academic_data["modules"]
        )
        scores_data = scores_gen.generate()
        missed_count = sum(1 for r in scores_data["assessment_results"] if r["score_obtained"] == 0.0)
        late_count = sum(1 for r in scores_data["assessment_results"] if r["is_late"])
        print(f"[Score Results Data] Generated {len(scores_data['assessment_results']):,} Assessment Scores (Anomalies: {missed_count:,} Missed Tests/Zeroes, {late_count:,} Late Submissions).")

        # 7. Attendance Sessions & Records (~400k target)
        attendance_gen = AttendanceGenerator(
            scale_cfg,
            student_data["students"],
            enrollment_data["enrollments"],
            academic_data["modules"],
            academic_data["semesters"],
            personnel_data["lecturers"]
        )
        attendance_data = attendance_gen.generate()
        att_breakdown = {}
        for r in attendance_data["attendance_records"]:
            st = r["status"]
            att_breakdown[st] = att_breakdown.get(st, 0) + 1
        print(f"[Attendance Data] Generated {len(attendance_data['attendance_sessions']):,} Lecture Sessions & {len(attendance_data['attendance_records']):,} Attendance Records (Breakdown: {att_breakdown}).")

        # 8. JSONB Student Learning Events (~200k target)
        events_gen = LearningEventsGenerator(
            scale_cfg,
            student_data["students"],
            academic_data["modules"],
            academic_data["semesters"]
        )
        events_data = events_gen.generate()
        event_types = {}
        for ev in events_data["student_learning_events"]:
            et = ev["event_type"]
            event_types[et] = event_types.get(et, 0) + 1
        print(f"[Learning Events Data] Generated {len(events_data['student_learning_events']):,} JSONB Learning & Clickstream Events (Types: {event_types}).")

    print("[SUCCESS] Synthetic dataset pipeline architecture initialized successfully.")

if __name__ == "__main__":
    main()
