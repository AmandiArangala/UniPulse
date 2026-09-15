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
        print(f"[Personnel Data] Generated {len(personnel_data['lecturers'])} Lecturers, {len(personnel_data['advisors'])} Academic Advisors, and {len(personnel_data['users'])} Auth User Accounts.")

    print("[SUCCESS] Synthetic dataset pipeline architecture initialized successfully.")

if __name__ == "__main__":
    main()
