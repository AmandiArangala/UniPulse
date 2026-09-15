"""
UniPulse Synthetic Data Generator - Common Utility Functions
"""

import random
import time
import json
import uuid
import numpy as np
from faker import Faker
from typing import Any, Dict

fake = Faker()

def seed_everything(seed: int = 42) -> None:
    """Set seeds for reproducibility across random, numpy, and faker."""
    random.seed(seed)
    np.random.seed(seed)
    Faker.seed(seed)

def generate_uuid() -> str:
    """Generate a deterministic or standard UUID string."""
    return str(uuid.uuid4())

def escape_sql_string(val: str) -> str:
    """Escape single quotes for PostgreSQL literal insertion."""
    if val is None:
        return "NULL"
    cleaned = str(val).replace("'", "''")
    return f"'{cleaned}'"

def format_sql_jsonb(data: Dict[str, Any]) -> str:
    """Format dictionary into PostgreSQL JSONB literal."""
    if data is None:
        return "NULL"
    json_str = json.dumps(data).replace("'", "''")
    return f"'{json_str}'::jsonb"

class Timer:
    """Simple contextual execution timer."""
    def __init__(self, name: str):
        self.name = name

    def __enter__(self):
        self.start = time.time()
        print(f"[START] [{self.name}]...")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start
        print(f"[COMPLETE] [{self.name}] in {elapsed:.2f}s")
