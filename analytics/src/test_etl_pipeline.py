"""
UniPulse Python ETL Pipeline Automated Test & Integrity Suite (test_etl_pipeline.py)
Platform: PostgreSQL 16 / Supabase
Phase 4: Data Engine & Star Schema ETL Unit & Integration Testing

Validates:
1. Database connectivity & target schema existence
2. Pandas data cleaning & score range clipping [0.0, 100.0]
3. NumPy linear regression rolling performance slope calculation
4. Composite Academic Health Score & risk level classification
5. End-to-end idempotent ETL execution
"""

import sys
import unittest
import pandas as pd
import numpy as np

from etl_pipeline import UniPulseETLPipeline, setup_logger

class TestUniPulseETLPipeline(unittest.TestCase):
    """Unit and Integration tests for UniPulse ETL Pipeline engine."""

    @classmethod
    def setUpClass(cls):
        cls.logger = setup_logger("ERROR")
        cls.pipeline = UniPulseETLPipeline(logger=cls.logger)

    def test_01_score_range_cleaning_and_imputation(self):
        """Test data cleaning stage: missing score imputation & score clipping [0.0, 100.0]."""
        raw_results = pd.DataFrame({
            "result_id": ["r1", "r2", "r3", "r4"],
            "student_id": ["s1", "s1", "s2", "s2"],
            "assessment_id": ["a1", "a2", "a1", "a2"],
            "score_obtained": [-15.0, 150.0, None, 85.0],
            "max_score": [100.0, 100.0, 100.0, 100.0],
            "weight_percentage": [20.0, 80.0, 20.0, 80.0],
            "is_late": [False, True, None, False]
        })

        raw_data = {"assessment_results": raw_results}
        cleaned_data = self.pipeline.clean(raw_data)
        
        self.assertIn("assessment_results", cleaned_data)
        df_clean = cleaned_data["assessment_results"]
        
        # Verify no negative or >100 percentage scores exist
        self.assertTrue((df_clean["percentage_score"] >= 0.0).all())
        self.assertTrue((df_clean["percentage_score"] <= 100.0).all())
        
        # Check specific imputed/clipped values
        scores = df_clean["percentage_score"].tolist()
        self.assertEqual(scores[0], 0.0)    # -15 clipped to 0.0
        self.assertEqual(scores[1], 100.0)  # 150 clipped to 100.0
        self.assertEqual(scores[2], 0.0)    # None imputed to 0.0

    def test_02_rolling_performance_slope_calculation(self):
        """Test linear regression rolling performance trajectory slope calculation."""
        # 1. Improving trend
        improving_scores = pd.Series([50.0, 60.0, 75.0, 90.0])
        trend_improving = self.pipeline._calculate_trend_slope(improving_scores)
        self.assertGreater(trend_improving, 50.0)

        # 2. Declining trend
        declining_scores = pd.Series([90.0, 75.0, 60.0, 45.0])
        trend_declining = self.pipeline._calculate_trend_slope(declining_scores)
        self.assertLess(trend_declining, 50.0)

        # 3. Single score (neutral baseline)
        single_score = pd.Series([80.0])
        trend_single = self.pipeline._calculate_trend_slope(single_score)
        self.assertEqual(trend_single, 50.0)

    def test_03_health_score_and_risk_categorization(self):
        """Test feature engineering transformation math and attention level risk categories."""
        sample_cleaned = {
            "enrollments": pd.DataFrame([{
                "student_id": "std-101",
                "module_id": "mod-201",
                "semester_id": "sem-301",
                "status": "ENROLLED"
            }]),
            "assessment_results": pd.DataFrame([
                {
                    "student_id": "std-101",
                    "module_id": "mod-201",
                    "assessment_id": "ass-1",
                    "percentage_score": 90.0,
                    "weight_percentage": 50.0
                },
                {
                    "student_id": "std-101",
                    "module_id": "mod-201",
                    "assessment_id": "ass-2",
                    "percentage_score": 94.0,
                    "weight_percentage": 50.0
                }
            ]),
            "attendance_records": pd.DataFrame([
                {"attendance_id": "att-1", "student_id": "std-101", "module_id": "mod-201", "status": "PRESENT"},
                {"attendance_id": "att-2", "student_id": "std-101", "module_id": "mod-201", "status": "PRESENT"}
            ]),
            "students": pd.DataFrame(),
            "programs": pd.DataFrame()
        }

        transformed = self.pipeline.transform(sample_cleaned)
        self.assertIn("fact_performance", transformed)
        df_fact = transformed["fact_performance"]
        self.assertFalse(df_fact.empty)
        
        row = df_fact.iloc[0]
        self.assertEqual(row["attention_level"], "EXCELLENT")
        self.assertGreaterEqual(row["health_score"], 85.0)

    def test_04_database_connection(self):
        """Test database connectivity to operational and analytical schemas when DB is reachable."""
        conn_ok = self.pipeline.test_connection()
        if not conn_ok:
            self.skipTest("Database server unreachable at configured DATABASE_URL. Skipping live DB test.")
        self.assertTrue(conn_ok)

    def test_05_idempotent_pipeline_execution(self):
        """Test end-to-end ETL pipeline execution idempotency when DB is reachable."""
        if not self.pipeline.test_connection():
            self.skipTest("Database server unreachable at configured DATABASE_URL. Skipping live pipeline execution test.")
            
        success_first = self.pipeline.run()
        self.assertTrue(success_first, "First ETL pipeline run should complete successfully.")
        
        # Second run on same dataset (Verifies idempotency with ON CONFLICT upserts)
        success_second = self.pipeline.run()
        self.assertTrue(success_second, "Second idempotent ETL pipeline run should complete successfully without duplicate conflicts.")

if __name__ == "__main__":
    unittest.main()
