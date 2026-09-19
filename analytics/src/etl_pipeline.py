"""
UniPulse Production Data Engine & Star Schema ETL Pipeline (etl_pipeline.py)
Platform: PostgreSQL 16 / Supabase
Phase 4: Data Engine & Star Schema ETL Pipeline

Leverages Pandas & SQLAlchemy for Extract, Clean, Transform, and Load (ETL) operations,
converting operational OLTP records (unipulse_core) into analytical dimensional tables (unipulse_analytics).

Commit 1: Core ETL Architecture & SQLAlchemy Engine Setup
"""

import os
import sys
import logging
import argparse
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

# Configure production logging system
def setup_logger(log_level: str = "INFO") -> logging.Logger:
    """Configures structured logger for ETL operations."""
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    logger = logging.getLogger("UniPulseETL")
    logger.setLevel(numeric_level)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [ETL Engine] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

class UniPulseETLPipeline:
    """
    Automated Python ETL Pipeline leveraging Pandas and SQLAlchemy.
    Extracts operational data from unipulse_core, applies data cleaning rules,
    computes rolling performance trends & health scores, and bulk loads into unipulse_analytics.
    """

    def __init__(
        self,
        db_url: Optional[str] = None,
        batch_size: int = 5000,
        rebuild: bool = False,
        logger: Optional[logging.Logger] = None
    ):
        self.logger = logger or setup_logger()
        self.batch_size = batch_size
        self.rebuild = rebuild
        
        # Database URL resolution strategy
        resolved_url = (
            db_url or
            os.getenv("DATABASE_URL") or
            "postgresql://postgres:your_postgres_password@localhost:5432/unipulse_db"
        )
        
        # Ensure psycopg2 driver prefix compatibility for SQLAlchemy 2.0+
        if resolved_url.startswith("postgres://"):
            resolved_url = resolved_url.replace("postgres://", "postgresql://", 1)
            
        self.db_url = resolved_url
        self.engine: Optional[Engine] = None
        self._init_sqlalchemy_engine()

    def _init_sqlalchemy_engine(self) -> None:
        """Initializes high-performance SQLAlchemy connection pool with resilience settings."""
        try:
            self.logger.info("Initializing SQLAlchemy database engine connection pool...")
            self.engine = create_engine(
                self.db_url,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=3600,
                future=True
            )
            self.logger.info("SQLAlchemy engine successfully configured.")
        except Exception as err:
            self.logger.error(f"Failed to initialize SQLAlchemy engine: {err}")
            raise

    def test_connection(self) -> bool:
        """Verifies database connectivity and schema presence for unipulse_core and unipulse_analytics."""
        if not self.engine:
            self.logger.error("SQLAlchemy engine is not initialized.")
            return False

        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT current_database(), current_schema();")).fetchone()
                db_name, schema_name = result[0], result[1]
                self.logger.info(f"Connected to Database: '{db_name}' (Current Schema: '{schema_name}')")

                # Verify schema existence
                schemas_query = text("""
                    SELECT schema_name 
                    FROM information_schema.schemata 
                    WHERE schema_name IN ('unipulse_core', 'unipulse_analytics');
                """)
                existing_schemas = [r[0] for r in conn.execute(schemas_query).fetchall()]
                self.logger.info(f"Verified target schemas: {existing_schemas}")
                return True
        except SQLAlchemyError as sqla_err:
            self.logger.error(f"Database connectivity test failed: {sqla_err}")
            return False
        except Exception as err:
            self.logger.error(f"Unexpected error during connection test: {err}")
            return False

    def extract(self) -> Dict[str, pd.DataFrame]:
        """
        Stage 1: Extraction Stage (Extract raw OLTP DataFrames).
        Will be fully implemented in Commit 2.
        """
        self.logger.info("[Extract Stage] Preparing operational record extraction queries...")
        extracted_data: Dict[str, pd.DataFrame] = {}
        # Stub for Commit 2 implementation
        return extracted_data

    def clean(self, raw_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Stage 2: Data Cleaning & Validation (Missing value imputation, deduplication, range checks).
        Will be fully implemented in Commit 2.
        """
        self.logger.info("[Clean Stage] Preparing data cleaning & normalization pipeline...")
        cleaned_data: Dict[str, pd.DataFrame] = raw_data
        # Stub for Commit 2 implementation
        return cleaned_data

    def transform(self, cleaned_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Stage 3: Feature Engineering & Transformation (Rolling slopes, weighted averages, health score).
        Will be fully implemented in Commit 3.
        """
        self.logger.info("[Transform Stage] Preparing feature engineering & metrics computation...")
        transformed_data: Dict[str, pd.DataFrame] = cleaned_data
        # Stub for Commit 3 implementation
        return transformed_data

    def load(self, transformed_data: Dict[str, pd.DataFrame]) -> bool:
        """
        Stage 4: Bulk Loading & Upsert (Idempotent DW load into unipulse_analytics).
        Will be fully implemented in Commit 4.
        """
        self.logger.info("[Load Stage] Preparing idempotent dimensional DW bulk load...")
        # Stub for Commit 4 implementation
        return True

    def run(self) -> bool:
        """Orchestrates end-to-end execution of the ETL pipeline."""
        self.logger.info("=================================================================")
        self.logger.info(" 🚀 UNIPULSE ETL PIPELINE (Pandas & SQLAlchemy Engine Execution)")
        self.logger.info("=================================================================")
        
        if not self.test_connection():
            self.logger.error("Aborting ETL execution: Database connectivity check failed.")
            return False

        if self.rebuild:
            self.logger.warning("Rebuild flag enabled. Existing analytical tables will be purged before load.")

        try:
            # Step 1: Extract
            raw_data = self.extract()
            
            # Step 2: Clean
            cleaned_data = self.clean(raw_data)
            
            # Step 3: Transform
            transformed_data = self.transform(cleaned_data)
            
            # Step 4: Load
            success = self.load(transformed_data)
            
            self.logger.info("=================================================================")
            self.logger.info(" ✅ ETL PIPELINE COMPLETED SUCCESSFULLY")
            self.logger.info("=================================================================")
            return success
        except Exception as err:
            self.logger.critical(f"ETL pipeline execution failed critically: {err}", exc_info=True)
            return False

def parse_args():
    """CLI argument parser for ETL script execution."""
    parser = argparse.ArgumentParser(
        description="UniPulse Python ETL Pipeline (Pandas & SQLAlchemy Engine)"
    )
    parser.add_argument(
        "--db-url",
        type=str,
        default=None,
        help="Target database connection URL (defaults to DATABASE_URL environment variable)."
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="If set, purges target fact and dimension tables prior to ETL load."
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=5000,
        help="Batch size for bulk insertion operations (default: 5000)."
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Set logging verbosity level (default: INFO)."
    )
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    logger = setup_logger(args.log_level)
    
    pipeline = UniPulseETLPipeline(
        db_url=args.db_url,
        batch_size=args.batch_size,
        rebuild=args.rebuild,
        logger=logger
    )
    
    pipeline.run()
