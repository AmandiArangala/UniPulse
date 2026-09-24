"""
UniPulse Statistical Aggregations & Summary Views Automated Test Suite (test_summary_aggregation.py)
"""

import os
import sys
import unittest
import pandas as pd
import numpy as np

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from summary_aggregator import SummaryAggregator


class TestSummaryAggregation(unittest.TestCase):
    """Automated test cases for statistical summary aggregations and Power BI exports."""

    def setUp(self):
        self.aggregator = SummaryAggregator()

    def test_student_analytics_dataframe_structure(self):
        """Verify student_analytics schema contains required statistical columns."""
        df = self.aggregator.fetch_student_analytics(limit=10)
        self.assertFalse(df.empty, "student_analytics dataframe should not be empty.")
        
        required_cols = [
            "student_key", "student_number", "full_name", "program_name",
            "mean_assessment_score", "stddev_assessment_score",
            "mean_attendance_rate", "stddev_attendance_rate",
            "attendance_performance_corr", "pass_rate", "mean_health_score"
        ]
        for col in required_cols:
            self.assertIn(col, df.columns, f"Missing required column: {col}")

    def test_module_analytics_dataframe_structure(self):
        """Verify module_analytics schema contains required metrics."""
        df = self.aggregator.fetch_module_analytics(limit=10)
        self.assertFalse(df.empty, "module_analytics dataframe should not be empty.")
        
        required_cols = [
            "module_key", "module_code", "module_title", "total_enrolled_students",
            "mean_score", "stddev_score", "min_score", "max_score",
            "pass_rate", "attendance_performance_corr", "mean_health_score"
        ]
        for col in required_cols:
            self.assertIn(col, df.columns, f"Missing required column: {col}")

    def test_semester_analytics_dataframe_structure(self):
        """Verify semester_analytics schema contains required macro metrics."""
        df = self.aggregator.fetch_semester_analytics(limit=10)
        self.assertFalse(df.empty, "semester_analytics dataframe should not be empty.")
        
        required_cols = [
            "semester_key", "semester_name", "academic_year",
            "total_enrolled_students", "total_modules_taught", "mean_score",
            "overall_pass_rate", "attendance_performance_corr"
        ]
        for col in required_cols:
            self.assertIn(col, df.columns, f"Missing required column: {col}")

    def test_statistical_calculations_accuracy(self):
        """Verify mean and stddev math logic against known datasets."""
        mock_data = pd.DataFrame({
            "score": [60.0, 70.0, 80.0, 90.0, 100.0]
        })
        stats = self.aggregator.calculate_summary_statistics(mock_data, "score")
        self.assertAlmostEqual(stats["mean"], 80.0, places=2)
        self.assertAlmostEqual(stats["min"], 60.0, places=2)
        self.assertAlmostEqual(stats["max"], 100.0, places=2)
        self.assertAlmostEqual(stats["median"], 80.0, places=2)

    def test_pearson_correlation_bounds(self):
        """Verify Pearson correlation coefficient is strictly within [-1.0, 1.0]."""
        df = self.aggregator.fetch_student_analytics()
        corr = self.aggregator.calculate_attendance_score_correlation(df)
        self.assertTrue(-1.0 <= corr <= 1.0, f"Correlation {corr} out of valid Pearson bounds [-1.0, 1.0].")

    def test_powerbi_csv_export_generation(self):
        """Verify export_powerbi_datasets produces valid CSV files."""
        output_dir = os.path.join("powerbi", "exports")
        s_path, m_path, sem_path = self.aggregator.export_powerbi_datasets(output_dir)
        
        self.assertTrue(os.path.exists(s_path), f"File {s_path} does not exist.")
        self.assertTrue(os.path.exists(m_path), f"File {m_path} does not exist.")
        self.assertTrue(os.path.exists(sem_path), f"File {sem_path} does not exist.")
        
        s_df = pd.read_csv(s_path)
        self.assertGreater(len(s_df), 0, "Exported student CSV should contain rows.")


if __name__ == "__main__":
    unittest.main()
