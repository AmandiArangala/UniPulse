"""
UniPulse JSONB Student Learning Event & Clickstream Engine
Generates ~200k semi-structured JSONB events (LMS clickstreams, video views, forum posts, resource downloads).
"""

import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from generator.config import GeneratorScale, PERSONA_PROFILES
from generator.utils import generate_uuid, fake

class LearningEventsGenerator:
    """Generates semi-structured JSONB clickstream and learning activity events."""

    EVENT_TYPES = [
        "LECTURE_VIDEO_VIEWED",
        "QUIZ_ATTEMPTED",
        "RESOURCE_DOWNLOADED",
        "FORUM_POST_CREATED",
        "ASSIGNMENT_SUBMITTED",
        "LOGIN_SESSION"
    ]

    DEVICES = ["Desktop Chrome / macOS", "Desktop Firefox / Windows", "Mobile Safari / iOS", "Android App / Chrome"]

    def __init__(
        self,
        scale: GeneratorScale,
        students: List[Dict[str, Any]],
        modules: List[Dict[str, Any]],
        semesters: List[Dict[str, Any]]
    ):
        self.scale = scale
        self.students = students
        self.modules = modules
        self.semesters = semesters
        self.events: List[Dict[str, Any]] = []

    def generate(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate scaled JSONB student learning events."""

        num_target = self.scale.target_jsonb_events
        mod_codes = [m["code"] for m in self.modules]
        start_sem_dt = datetime.strptime(self.semesters[0]["start_date"], "%Y-%m-%d")
        end_sem_dt = datetime.strptime(self.semesters[-1]["end_date"], "%Y-%m-%d")
        total_days = max(1, (end_sem_dt - start_sem_dt).days)

        # Calculate per-student event count weights based on persona
        event_counts = []
        for student in self.students:
            persona = student["persona"]
            mean_events = PERSONA_PROFILES[persona]["weekly_events_mean"]
            cnt = int(np.random.normal(mean_events * 4, mean_events * 0.8))
            event_counts.append(max(1, cnt))

        total_alloc = sum(event_counts)
        scale_factor = num_target / total_alloc if total_alloc > 0 else 1.0

        for idx, student in enumerate(self.students):
            s_id = student["user_id"]
            persona = student["persona"]
            target_count = max(2, int(event_counts[idx] * scale_factor))

            for _ in range(target_count):
                event_type = random.choice(self.EVENT_TYPES)
                mod_code = random.choice(mod_codes)
                rand_days = random.randint(0, total_days)
                created_at = (start_sem_dt + timedelta(days=rand_days, minutes=random.randint(0, 1439))).strftime("%Y-%m-%dT%H:%M:%SZ")
                device = random.choice(self.DEVICES)

                # Generate event_details JSON payload based on event_type
                if event_type == "LECTURE_VIDEO_VIEWED":
                    details = {
                        "module_code": mod_code,
                        "lecture_number": random.randint(1, 14),
                        "watch_duration_minutes": random.randint(5, 90),
                        "completion_percentage": random.randint(20, 100),
                        "playback_speed": random.choice([1.0, 1.25, 1.5, 2.0]),
                        "device": device
                    }
                elif event_type == "QUIZ_ATTEMPTED":
                    details = {
                        "module_code": mod_code,
                        "quiz_title": f"Self-Assessment Quiz {random.randint(1, 5)}",
                        "attempt_number": random.randint(1, 3),
                        "score_percentage": random.randint(40, 100),
                        "time_spent_seconds": random.randint(300, 2400),
                        "flagged_questions_count": random.randint(0, 4)
                    }
                elif event_type == "RESOURCE_DOWNLOADED":
                    details = {
                        "module_code": mod_code,
                        "resource_name": f"{mod_code}_Lecture_Notes_Week_{random.randint(1, 12)}.pdf",
                        "file_size_mb": round(random.uniform(0.5, 15.0), 2),
                        "download_speed_mbps": round(random.uniform(10.0, 100.0), 1),
                        "device": device
                    }
                elif event_type == "FORUM_POST_CREATED":
                    details = {
                        "module_code": mod_code,
                        "thread_id": f"thread_{random.randint(100, 999)}",
                        "action": random.choice(["POST_REPLY", "NEW_QUESTION", "UPVOTE"]),
                        "word_count": random.randint(15, 250),
                        "sentiment": random.choice(["POSITIVE", "NEUTRAL", "CONFUSED"])
                    }
                elif event_type == "ASSIGNMENT_SUBMITTED":
                    details = {
                        "module_code": mod_code,
                        "assignment_title": f"Assignment {random.randint(1, 4)}",
                        "file_format": random.choice(["pdf", "zip", "py", "docx"]),
                        "file_size_bytes": random.randint(50000, 5000000),
                        "is_late": random.random() < 0.15
                    }
                else:  # LOGIN_SESSION
                    details = {
                        "session_id": f"sess_{random.randint(100000, 999999)}",
                        "login_method": random.choice(["OAuth2_SSO", "Password_Auth", "Remember_Token"]),
                        "duration_minutes": random.randint(2, 180),
                        "pages_visited_count": random.randint(3, 35),
                        "device": device
                    }

                self.events.append({
                    "id": generate_uuid(),
                    "student_id": s_id,
                    "event_type": event_type,
                    "event_details": details,
                    "created_at": created_at
                })

        return {"student_learning_events": self.events}
