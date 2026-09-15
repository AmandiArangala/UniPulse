"""
UniPulse Assessment Structure & Topic Breakdown Generator
Generates module assessment suites (Quizzes, Midterms, Projects, Finals) and diagnostic topic tags.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from generator.config import GeneratorScale
from generator.utils import generate_uuid

class AssessmentStructureGenerator:
    """Generates course assessments and topic breakdowns for modules across semesters."""

    TOPIC_DICTIONARY = {
        "CS": [
            "Variables & Control Flow", "Array & String Manipulation", "Pointers & Memory Allocation",
            "Recursion & Dynamic Programming", "Sorting & Searching Algorithms", "Tree & Graph Traversals",
            "Relational Schema Design", "SQL Joins & Aggregations", "B-Tree Indexing & Query Plans",
            "Process Management & Concurrency", "Virtual Memory & Paging", "Neural Network Architecture"
        ],
        "SE": [
            "Git Branching & Merge Conflicts", "UML Class & Sequence Diagrams", "SOLID Design Principles",
            "RESTful API & Endpoint Design", "Unit Testing & Mocking", "Microservices Architecture",
            "Docker Containerization", "CI/CD Pipeline Automation", "OWASP Top 10 Vulnerabilities",
            "Cryptographic Hashing & Encryption", "Agile Sprint Planning", "Refactoring Smells"
        ],
        "ECE": [
            "Ohm's & Kirchhoff's Circuit Laws", "Op-Amps & Transistors", "Digital Logic Gates & Boolean Algebra",
            "Verilog HDL Module Design", "Fourier & Laplace Transforms", "Microcontroller Interrupts & Timers"
        ],
        "ME": [
            "Statics & Vector Force Equilibrium", "Kinematics of Rigid Bodies", "First & Second Thermodynamics Laws",
            "Heat Conduction & Radiation", "Bernoulli Fluid Dynamics", "3D CAD Modeling & FEA Stress Analysis"
        ],
        "FIN": [
            "Financial Statement Analysis", "Time Value of Money & DCF", "Capital Budgeting & NPV",
            "Cost of Capital & WACC", "Fintech & Algorithmic Trading", "Portfolio Diversification & CAPM"
        ],
        "MKT": [
            "Marketing Mix 4Ps Strategy", "Customer Segmentation & Personas", "SEO & Paid PPC Campaigns",
            "Conversion Rate Optimization", "Brand Equity & Position", "Consumer Journey Analytics"
        ],
        "PSY": [
            "Cognitive Memory & Perception", "Neuroanatomy & Brain Structures", "Experimental Research Methods",
            "ANOVA & Hypothesis Testing", "Lifespan Human Development", "Behavioral Conditioning"
        ],
        "SOC": [
            "Social Inequality & Class", "Public Policy Formation", "Quantitative Survey Sampling",
            "Linear Regression & Social Metrics", "Demographic Trend Analysis", "Global Policy Impact"
        ]
    }

    ASSESSMENT_SUITES = [
        {"title": "Quiz 1: Core Fundamentals", "type": "QUIZ", "weight": 10.0, "week_offset": 3},
        {"title": "Quiz 2: Intermediate Concepts", "type": "QUIZ", "weight": 10.0, "week_offset": 6},
        {"title": "Midterm Examination", "type": "MIDTERM", "weight": 30.0, "week_offset": 8},
        {"title": "Practical Coursework & Project", "type": "PROJECT", "weight": 20.0, "week_offset": 12},
        {"title": "Final Comprehensive Exam", "type": "FINAL", "weight": 30.0, "week_offset": 15}
    ]

    def __init__(
        self,
        scale: GeneratorScale,
        modules: List[Dict[str, Any]],
        semesters: List[Dict[str, Any]],
        departments: List[Dict[str, Any]]
    ):
        self.scale = scale
        self.modules = modules
        self.semesters = semesters
        self.dept_map = {d["id"]: d["code"] for d in departments}
        self.assessments: List[Dict[str, Any]] = []
        self.topics: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate assessment suites and topic tags for all modules across semesters."""

        for sem in self.semesters:
            sem_id = sem["id"]
            start_dt = datetime.strptime(sem["start_date"], "%Y-%m-%d")

            for mod in self.modules:
                mod_id = mod["id"]
                dept_code = self.dept_map.get(mod["department_id"], "CS")
                available_topics = self.TOPIC_DICTIONARY.get(dept_code, self.TOPIC_DICTIONARY["CS"])

                for item in self.ASSESSMENT_SUITES:
                    ass_id = generate_uuid()
                    due_date = (start_dt + timedelta(weeks=item["week_offset"])).strftime("%Y-%m-%dT23:59:59Z")

                    self.assessments.append({
                        "id": ass_id,
                        "module_id": mod_id,
                        "semester_id": sem_id,
                        "title": f"{mod['code']}: {item['title']}",
                        "type": item["type"],
                        "weight_percentage": item["weight"],
                        "max_score": 100.0,
                        "due_date": due_date,
                        "is_published": True
                    })

                    # Add 1 to 2 diagnostic topic tags per assessment
                    chosen_topics = random.sample(available_topics, min(2, len(available_topics)))
                    for t_name in chosen_topics:
                        self.topics.append({
                            "id": generate_uuid(),
                            "assessment_id": ass_id,
                            "topic_name": t_name,
                            "weight_contribution": round(item["weight"] / len(chosen_topics), 2),
                            "description": f"Diagnostic topic evaluating mastery of {t_name}."
                        })

        return {
            "assessments": self.assessments,
            "topics": self.topics
        }
