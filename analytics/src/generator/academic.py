"""
UniPulse Academic Catalog Structure Generator
Faculties, Departments, Programs, Modules, Prerequisites, and Semesters
"""

import uuid
from typing import List, Dict, Any, Tuple
from generator.config import GeneratorScale
from generator.utils import generate_uuid

class AcademicStructureGenerator:
    """Generates realistic academic metadata hierarchy."""

    FACULTY_DATA = [
        {"code": "FST", "name": "Faculty of Science and Technology", "desc": "Computer Science, Software Engineering, and Data Science"},
        {"code": "FOE", "name": "Faculty of Engineering", "desc": "Electrical, Computer, and Mechanical Engineering"},
        {"code": "FOB", "name": "Faculty of Business & Economics", "desc": "Finance, Accounting, Marketing, and Management"},
        {"code": "FHS", "name": "Faculty of Humanities & Social Sciences", "desc": "Psychology, Sociology, and Public Policy"}
    ]

    DEPARTMENT_DATA = [
        # FST
        {"faculty_code": "FST", "code": "CS", "name": "Department of Computer Science"},
        {"faculty_code": "FST", "code": "SE", "name": "Department of Software Engineering"},
        # FOE
        {"faculty_code": "FOE", "code": "ECE", "name": "Department of Electrical & Computer Engineering"},
        {"faculty_code": "FOE", "code": "ME", "name": "Department of Mechanical Engineering"},
        # FOB
        {"faculty_code": "FOB", "code": "FIN", "name": "Department of Finance & Accounting"},
        {"faculty_code": "FOB", "code": "MKT", "name": "Department of Marketing & Management"},
        # FHS
        {"faculty_code": "FHS", "code": "PSY", "name": "Department of Psychology"},
        {"faculty_code": "FHS", "code": "SOC", "name": "Department of Sociology & Public Policy"}
    ]

    PROGRAM_DATA = [
        {"dept_code": "CS", "code": "BS-CS", "name": "BSc in Computer Science", "level": "UNDERGRADUATE", "credits": 120},
        {"dept_code": "CS", "code": "BS-DS", "name": "BSc in Data Science & AI", "level": "UNDERGRADUATE", "credits": 120},
        {"dept_code": "SE", "code": "BS-SE", "name": "BSc in Software Engineering", "level": "UNDERGRADUATE", "credits": 120},
        {"dept_code": "SE", "code": "MS-CY", "name": "MSc in Cybersecurity & Privacy", "level": "POSTGRADUATE", "credits": 60},
        {"dept_code": "ECE", "code": "BE-EE", "name": "BEng in Electrical Engineering", "level": "UNDERGRADUATE", "credits": 130},
        {"dept_code": "ME", "code": "BE-ME", "name": "BEng in Mechanical Engineering", "level": "UNDERGRADUATE", "credits": 130},
        {"dept_code": "FIN", "code": "BBA-FIN", "name": "BBA in Finance & Fintech", "level": "UNDERGRADUATE", "credits": 120},
        {"dept_code": "MKT", "code": "BBA-MKT", "name": "BBA in Digital Marketing", "level": "UNDERGRADUATE", "credits": 120},
        {"dept_code": "PSY", "code": "BA-PSY", "name": "BA in Applied Psychology", "level": "UNDERGRADUATE", "credits": 120},
        {"dept_code": "SOC", "code": "BA-SOC", "name": "BA in Public Policy & Governance", "level": "UNDERGRADUATE", "credits": 120}
    ]

    MODULE_TEMPLATES = [
        # CS & SE Modules
        ("CS", "CS101", "Introduction to Programming Principles", 4, "Core procedural and object-oriented concepts using Python."),
        ("CS", "CS102", "Discrete Mathematics & Logic", 3, "Sets, logic, proofs, graph theory, and combinatorics."),
        ("CS", "CS201", "Data Structures & Algorithms", 4, "Trees, graphs, searching, sorting, and algorithmic complexity."),
        ("CS", "CS202", "Computer Organization & Architecture", 3, "Assembly language, memory hierarchy, and processor design."),
        ("CS", "CS301", "Database Systems & SQL Internals", 4, "Relational databases, indexing, query optimization, and ACID properties."),
        ("CS", "CS302", "Operating Systems & Kernel Concepts", 4, "Processes, threading, memory management, and concurrency."),
        ("CS", "CS401", "Artificial Intelligence & Heuristics", 3, "Search algorithms, knowledge representation, and reasoning."),
        ("CS", "CS402", "Machine Learning & Statistical Data Analysis", 4, "Supervised learning, neural networks, and model evaluation."),
        ("SE", "SE101", "Software Development Fundamentals", 3, "Version control, testing practices, and software lifecycles."),
        ("SE", "SE201", "Object-Oriented Analysis & Design", 4, "UML design patterns, refactoring, and SOLID principles."),
        ("SE", "SE301", "Software Architecture & Microservices", 4, "Distributed systems, API design, and cloud patterns."),
        ("SE", "SE302", "Web & Mobile Applications Engineering", 4, "Full-stack development, modern frontend frameworks, and REST/GraphQL APIs."),
        ("SE", "SE401", "Software Testing & Quality Assurance", 3, "Automated unit, integration, and performance load testing."),
        ("SE", "SE402", "DevOps & CI/CD Pipeline Automation", 3, "Docker, Kubernetes, continuous delivery, and infrastructure as code."),
        ("SE", "SE403", "Cybersecurity Principles & Applied Cryptography", 4, "Encryption, authentication, and vulnerability assessment."),
        ("SE", "SE404", "Software Engineering Capstone Project", 6, "Year-long industry software engineering project."),

        # ECE & ME Modules
        ("ECE", "ECE101", "Circuit Theory & Analysis", 4, "Ohm's law, Kirchhoff's laws, and AC/DC circuit analysis."),
        ("ECE", "ECE201", "Digital Systems & Verilog Design", 4, "Logic gates, FPGA design, and hardware description languages."),
        ("ECE", "ECE301", "Signals & Linear Systems", 3, "Fourier transforms, Laplace transform, and continuous-time systems."),
        ("ECE", "ECE302", "Microcontrollers & Embedded C", 4, "Real-time operating systems, GPIO, and microcontrollers."),
        ("ECE", "ECE401", "Wireless Communication Networks", 3, "Signal propagation, cellular networks, and wireless protocols."),
        ("ME", "ME101", "Engineering Statics & Dynamics", 4, "Force systems, equilibrium, and kinematics."),
        ("ME", "ME201", "Thermodynamics & Heat Transfer", 4, "Laws of thermodynamics, heat exchangers, and conduction."),
        ("ME", "ME301", "Fluid Mechanics & Hydraulics", 3, "Fluid statics, Bernoulli equation, and pipe flow."),
        ("ME", "ME401", "Computer-Aided Design & Finite Element Analysis", 4, "3D CAD modeling, stress analysis, and structural mechanics."),

        # Business Modules
        ("FIN", "FIN101", "Principles of Financial Accounting", 3, "Financial statements, balance sheets, and cash flow."),
        ("FIN", "FIN201", "Corporate Finance & Valuation", 3, "Capital budgeting, cost of capital, and DCF valuation."),
        ("FIN", "FIN301", "Financial Markets & Fintech Innovations", 4, "Algorithmic trading, blockchain finance, and risk management."),
        ("FIN", "FIN401", "Investment Management & Portfolio Theory", 3, "Asset allocation, CAPM model, and options trading."),
        ("MKT", "MKT101", "Introduction to Marketing Strategy", 3, "Consumer behavior, market segmentation, and branding."),
        ("MKT", "MKT201", "Digital Marketing & Growth Hacking", 3, "SEO, PPC campaigns, and conversion rate optimization."),
        ("MKT", "MKT301", "Consumer Psychology & Behavioral Analytics", 4, "Customer analytics, journey mapping, and survey design."),
        ("MKT", "MKT401", "Brand Management & Product Strategy", 3, "Product lifecycle management and competitive positioning."),

        # Humanities & Social Sciences
        ("PSY", "PSY101", "Introduction to Psychology", 3, "Cognitive processes, neuroscience, and human behavior."),
        ("PSY", "PSY201", "Cognitive Neuroscience & Learning", 4, "Memory systems, perception, and brain anatomy."),
        ("PSY", "PSY301", "Research Methods & Behavioral Statistics", 4, "Experimental design, ANOVA, and SPSS analysis."),
        ("PSY", "PSY401", "Developmental & Clinical Psychology", 3, "Lifespan development and psychopathology."),
        ("SOC", "SOC101", "Foundations of Sociology", 3, "Social structures, culture, and inequality."),
        ("SOC", "SOC201", "Public Policy Analysis & Governance", 4, "Policy formation, evaluation, and public administration."),
        ("SOC", "SOC301", "Quantitative Social Research Methods", 4, "Survey sampling, regression analysis, and demographic trends."),
        ("SOC", "SOC401", "Global Policy & Social Change", 3, "Globalization, environmental policy, and social movements.")
    ]

    SEMESTER_DATA = [
        {"name": "Fall 2021", "year": 2021, "start": "2021-09-01", "end": "2021-12-20", "is_current": False},
        {"name": "Spring 2022", "year": 2022, "start": "2022-01-15", "end": "2022-05-15", "is_current": False},
        {"name": "Fall 2022", "year": 2022, "start": "2022-09-01", "end": "2022-12-20", "is_current": False},
        {"name": "Spring 2023", "year": 2023, "start": "2023-01-15", "end": "2023-05-15", "is_current": False},
        {"name": "Fall 2023", "year": 2023, "start": "2023-09-01", "end": "2023-12-20", "is_current": False},
        {"name": "Spring 2024", "year": 2024, "start": "2024-01-15", "end": "2024-05-15", "is_current": False},
        {"name": "Fall 2024", "year": 2024, "start": "2024-09-01", "end": "2024-12-20", "is_current": False},
        {"name": "Spring 2025", "year": 2025, "start": "2025-01-15", "end": "2025-05-15", "is_current": False},
        {"name": "Fall 2025", "year": 2025, "start": "2025-09-01", "end": "2025-12-20", "is_current": False},
        {"name": "Spring 2026", "year": 2026, "start": "2026-01-15", "end": "2026-05-15", "is_current": True}
    ]

    def __init__(self, scale: GeneratorScale):
        self.scale = scale
        self.faculties: List[Dict[str, Any]] = []
        self.departments: List[Dict[str, Any]] = []
        self.programs: List[Dict[str, Any]] = []
        self.modules: List[Dict[str, Any]] = []
        self.prerequisites: List[Dict[str, Any]] = []
        self.semesters: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate all academic catalog entities respecting scale targets."""
        # 1. Faculties
        target_faculties = self.FACULTY_DATA[:self.scale.num_faculties]
        fac_code_to_id = {}
        for f in target_faculties:
            f_id = generate_uuid()
            fac_code_to_id[f["code"]] = f_id
            self.faculties.append({
                "id": f_id,
                "code": f["code"],
                "name": f["name"],
                "description": f["desc"]
            })

        # 2. Departments
        allowed_fac_codes = set(fac_code_to_id.keys())
        target_depts = [d for d in self.DEPARTMENT_DATA if d["faculty_code"] in allowed_fac_codes][:self.scale.num_departments]
        dept_code_to_id = {}
        for d in target_depts:
            d_id = generate_uuid()
            dept_code_to_id[d["code"]] = d_id
            self.departments.append({
                "id": d_id,
                "faculty_id": fac_code_to_id[d["faculty_code"]],
                "code": d["code"],
                "name": d["name"]
            })

        # 3. Programs
        allowed_dept_codes = set(dept_code_to_id.keys())
        target_progs = [p for p in self.PROGRAM_DATA if p["dept_code"] in allowed_dept_codes][:self.scale.num_programs]
        prog_code_to_id = {}
        for p in target_progs:
            p_id = generate_uuid()
            prog_code_to_id[p["code"]] = p_id
            self.programs.append({
                "id": p_id,
                "department_id": dept_code_to_id[p["dept_code"]],
                "code": p["code"],
                "name": p["name"],
                "degree_level": p["level"],
                "total_credits": p["credits"]
            })

        # 4. Modules
        target_mods = [m for m in self.MODULE_TEMPLATES if m[0] in allowed_dept_codes]
        if len(target_mods) > self.scale.num_modules:
            target_mods = target_mods[:self.scale.num_modules]

        mod_code_to_id = {}
        for dept_code, code, title, credits, desc in target_mods:
            m_id = generate_uuid()
            mod_code_to_id[code] = m_id
            self.modules.append({
                "id": m_id,
                "department_id": dept_code_to_id[dept_code],
                "code": code,
                "title": title,
                "credit_hours": credits,
                "description": desc
            })

        # 5. Prerequisites (Realistic pairs)
        prereq_pairs = [
            ("CS201", "CS101"),
            ("CS301", "CS201"),
            ("CS302", "CS201"),
            ("CS402", "CS201"),
            ("SE201", "SE101"),
            ("SE301", "SE201"),
            ("SE302", "SE201"),
            ("SE401", "SE201"),
            ("SE402", "SE301"),
            ("ECE201", "ECE101"),
            ("ECE302", "ECE201"),
            ("ME201", "ME101"),
            ("FIN201", "FIN101"),
            ("FIN301", "FIN201"),
            ("MKT201", "MKT101"),
            ("PSY201", "PSY101"),
            ("PSY301", "PSY201"),
            ("SOC201", "SOC101")
        ]
        for target_code, prereq_code in prereq_pairs:
            if target_code in mod_code_to_id and prereq_code in mod_code_to_id:
                self.prerequisites.append({
                    "module_id": mod_code_to_id[target_code],
                    "prerequisite_module_id": mod_code_to_id[prereq_code],
                    "is_mandatory": True,
                    "minimum_grade": "C"
                })

        # 6. Semesters
        target_sems = self.SEMESTER_DATA[:self.scale.num_semesters]
        for s in target_sems:
            s_id = generate_uuid()
            self.semesters.append({
                "id": s_id,
                "name": s["name"],
                "academic_year": s["year"],
                "start_date": s["start"],
                "end_date": s["end"],
                "is_current": s["is_current"]
            })

        return {
            "faculties": self.faculties,
            "departments": self.departments,
            "programs": self.programs,
            "modules": self.modules,
            "prerequisites": self.prerequisites,
            "semesters": self.semesters
        }
