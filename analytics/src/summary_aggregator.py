import os
import sys
import logging
import argparse
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [UniPulse Aggregator] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

class SummaryAggregator:
    """
    Statistical engine calculating Mean, Standard Deviation, Pass Rates, 
    and Pearson Attendance-Performance Correlation across OLAP Star Schema.
    """

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or os.getenv(
            "DATABASE_URL", 
            "postgresql://postgres:your_postgres_password@localhost:5432/unipulse_db"
        )

    def get_connection(self):
        return psycopg2.connect(self.db_url)

    def refresh_materialized_views(self) -> bool:
        """Executes procedure to refresh all materialized summary views in database."""
        logging.info("Triggering refresh of materialized summary analytics views...")
        try:
            conn = self.get_connection()
            conn.autocommit = True
            cursor = conn.cursor()
            
            # Execute refresh function if present, else refresh directly
            try:
                cursor.execute("SELECT unipulse_analytics.refresh_summary_analytics();")
                logging.info("[OK] Executed unipulse_analytics.refresh_summary_analytics() successfully.")
            except Exception as ex:
                logging.warning(f"Stored procedure refresh failed, falling back to direct SQL REFRESH: {ex}")
                cursor.execute("REFRESH MATERIALIZED VIEW unipulse_analytics.student_analytics;")
                cursor.execute("REFRESH MATERIALIZED VIEW unipulse_analytics.module_analytics;")
                cursor.execute("REFRESH MATERIALIZED VIEW unipulse_analytics.semester_analytics;")
                logging.info("[OK] Direct REFRESH MATERIALIZED VIEW statements executed successfully.")
                
            cursor.close()
            conn.close()
            return True
        except Exception as e:
            logging.error(f"Failed to refresh summary analytics materialized views: {e}")
            return False

    def fetch_student_analytics(self, limit: Optional[int] = None) -> pd.DataFrame:
        """Extracts student_analytics materialized view into pandas DataFrame."""
        query = "SELECT * FROM unipulse_analytics.student_analytics"
        if limit:
            query += f" LIMIT {int(limit)}"
        
        try:
            conn = self.get_connection()
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        except Exception as e:
            logging.warning(f"Database fetch student_analytics warning: {e}. Returning mock structure.")
            return self._generate_mock_student_analytics()

    def fetch_module_analytics(self, limit: Optional[int] = None) -> pd.DataFrame:
        """Extracts module_analytics materialized view into pandas DataFrame."""
        query = "SELECT * FROM unipulse_analytics.module_analytics"
        if limit:
            query += f" LIMIT {int(limit)}"
        
        try:
            conn = self.get_connection()
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        except Exception as e:
            logging.warning(f"Database fetch module_analytics warning: {e}. Returning mock structure.")
            return self._generate_mock_module_analytics()

    def fetch_semester_analytics(self, limit: Optional[int] = None) -> pd.DataFrame:
        """Extracts semester_analytics materialized view into pandas DataFrame."""
        query = "SELECT * FROM unipulse_analytics.semester_analytics"
        if limit:
            query += f" LIMIT {int(limit)}"
        
        try:
            conn = self.get_connection()
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        except Exception as e:
            logging.warning(f"Database fetch semester_analytics warning: {e}. Returning mock structure.")
            return self._generate_mock_semester_analytics()

    def calculate_summary_statistics(self, df: pd.DataFrame, metric_col: str) -> Dict[str, float]:
        """Calculates statistical suite: Mean, Standard Deviation, Min, Max, Median."""
        if df.empty or metric_col not in df.columns:
            return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0, "median": 0.0}

        series = pd.to_numeric(df[metric_col], errors="coerce").dropna()
        if series.empty:
            return {"mean": 0.0, "std": 0.0, "min": 0.0, "max": 0.0, "median": 0.0}

        return {
            "mean": float(series.mean()),
            "std": float(series.std(ddof=1)) if len(series) > 1 else 0.0,
            "min": float(series.min()),
            "max": float(series.max()),
            "median": float(series.median())
        }

    def calculate_attendance_score_correlation(self, df: pd.DataFrame) -> float:
        """Computes Pearson Correlation Coefficient between attendance_rate and score."""
        if df.empty or "mean_attendance_rate" not in df.columns or "mean_assessment_score" not in df.columns:
            return 0.0

        att = pd.to_numeric(df["mean_attendance_rate"], errors="coerce")
        score = pd.to_numeric(df["mean_assessment_score"], errors="coerce")
        valid = pd.DataFrame({"att": att, "score": score}).dropna()

        if len(valid) < 2:
            return 0.0

        corr = valid["att"].corr(valid["score"], method="pearson")
        return float(corr) if not np.isnan(corr) else 0.0

    def export_powerbi_datasets(self, output_dir: str = "powerbi/exports") -> Tuple[str, str, str]:
        """Exports clean summary views formatted for direct Power BI consumption."""
        os.makedirs(output_dir, exist_ok=True)

        student_df = self.fetch_student_analytics()
        module_df = self.fetch_module_analytics()
        semester_df = self.fetch_semester_analytics()

        student_path = os.path.join(output_dir, "student_analytics.csv")
        module_path = os.path.join(output_dir, "module_analytics.csv")
        semester_path = os.path.join(output_dir, "semester_analytics.csv")

        student_df.to_csv(student_path, index=False)
        module_df.to_csv(module_path, index=False)
        semester_df.to_csv(semester_path, index=False)

        logging.info(f"[OK] Power BI dataset exported to: {student_path} ({len(student_df)} rows)")
        logging.info(f"[OK] Power BI dataset exported to: {module_path} ({len(module_df)} rows)")
        logging.info(f"[OK] Power BI dataset exported to: {semester_path} ({len(semester_df)} rows)")

        return student_path, module_path, semester_path

    def _generate_mock_student_analytics(self) -> pd.DataFrame:
        """Synthetic fallback data frame generator for offline testing."""
        np.random.seed(42)
        n = 50
        students = [f"STU-{1000 + i}" for i in range(n)]
        scores = np.random.normal(72, 14, n).clip(30, 100)
        attendance = np.random.normal(85, 10, n).clip(40, 100)
        
        return pd.DataFrame({
            "student_key": [f"00000000-0000-0000-0000-{i:012d}" for i in range(n)],
            "student_number": students,
            "full_name": [f"Student {i}" for i in range(n)],
            "email": [f"student{i}@university.edu" for i in range(n)],
            "program_name": ["BSc Computer Science"] * n,
            "department_name": ["Computer Science"] * n,
            "faculty_name": ["Faculty of Computing"] * n,
            "academic_status": ["GOOD_STANDING"] * n,
            "current_gpa": np.round(scores / 25.0, 2),
            "total_enrolled_modules": [4] * n,
            "mean_assessment_score": np.round(scores, 2),
            "stddev_assessment_score": np.round(np.random.uniform(3, 12, n), 2),
            "mean_attendance_rate": np.round(attendance, 2),
            "stddev_attendance_rate": np.round(np.random.uniform(2, 8, n), 2),
            "mean_submission_rate": np.round(attendance + 2, 2).clip(0, 100),
            "mean_health_score": np.round(scores * 0.40 + attendance * 0.20 + (attendance + 2).clip(0, 100) * 0.15 + 75.0 * 0.15 + 85.0 * 0.10, 2),
            "attendance_performance_corr": np.round(np.random.uniform(0.4, 0.85, n), 4),
            "passed_modules_count": np.random.randint(3, 5, n),
            "pass_rate": np.round(np.random.uniform(75, 100, n), 2),
            "critical_modules_count": np.random.choice([0, 1], n, p=[0.8, 0.2]),
            "attention_required_modules_count": np.random.choice([0, 1, 2], n, p=[0.7, 0.2, 0.1]),
            "refreshed_at": [pd.Timestamp.now()] * n
        })

    def _generate_mock_module_analytics(self) -> pd.DataFrame:
        """Synthetic fallback module analytics dataframe."""
        modules = ["CS101", "CS201", "CS301", "SE401", "DB302"]
        return pd.DataFrame({
            "module_key": [f"00000000-0000-0000-0001-{i:012d}" for i in range(len(modules))],
            "module_code": modules,
            "module_title": [f"{m} Title" for m in modules],
            "credit_hours": [3] * len(modules),
            "department_name": ["Computer Science"] * len(modules),
            "faculty_name": ["Faculty of Computing"] * len(modules),
            "total_enrolled_students": [120, 95, 80, 60, 110],
            "mean_score": [74.5, 68.2, 71.0, 79.4, 65.8],
            "stddev_score": [11.2, 14.5, 12.8, 9.5, 16.2],
            "min_score": [35.0, 28.0, 40.0, 48.0, 22.0],
            "max_score": [98.0, 95.0, 99.0, 100.0, 94.0],
            "passed_students_count": [108, 76, 70, 57, 88],
            "pass_rate": [90.0, 80.0, 87.5, 95.0, 80.0],
            "mean_attendance_rate": [88.5, 82.0, 84.5, 91.0, 79.5],
            "stddev_attendance_rate": [6.5, 9.2, 8.1, 5.4, 11.0],
            "mean_submission_rate": [92.0, 85.0, 89.0, 96.0, 83.0],
            "attendance_performance_corr": [0.68, 0.74, 0.62, 0.58, 0.79],
            "mean_health_score": [78.5, 72.0, 75.2, 83.0, 69.8],
            "critical_students_count": [4, 8, 5, 1, 10],
            "attention_required_students_count": [8, 11, 5, 2, 12],
            "excellent_students_count": [30, 20, 25, 22, 18],
            "refreshed_at": [pd.Timestamp.now()] * len(modules)
        })

    def _generate_mock_semester_analytics(self) -> pd.DataFrame:
        """Synthetic fallback semester analytics dataframe."""
        semesters = ["Semester 1 2025/2026", "Semester 2 2025/2026"]
        return pd.DataFrame({
            "semester_key": [f"00000000-0000-0000-0002-{i:012d}" for i in range(len(semesters))],
            "semester_name": semesters,
            "academic_year": [2026, 2026],
            "start_date": ["2026-01-15", "2026-07-15"],
            "end_date": ["2026-05-30", "2026-11-30"],
            "is_current": [True, False],
            "total_enrolled_students": [450, 430],
            "total_modules_taught": [15, 14],
            "total_enrollments": [1800, 1720],
            "mean_score": [72.8, 74.1],
            "stddev_score": [13.4, 12.8],
            "mean_attendance_rate": [86.2, 87.5],
            "stddev_attendance_rate": [8.4, 7.9],
            "mean_submission_rate": [89.1, 90.4],
            "attendance_performance_corr": [0.695, 0.712],
            "passed_enrollments_count": [1560, 1513],
            "overall_pass_rate": [86.67, 87.97],
            "mean_health_score": [76.4, 78.0],
            "critical_students_count": [28, 22],
            "critical_students_ratio": [6.22, 5.12],
            "refreshed_at": [pd.Timestamp.now()] * len(semesters)
        })


def main():
    parser = argparse.ArgumentParser(description="UniPulse Statistical Aggregator Engine")
    parser.add_argument("--refresh", action="store_true", help="Refresh database materialized summary views")
    parser.add_argument("--export-powerbi", action="store_true", help="Export summary CSV datasets for Power BI")
    parser.add_argument("--output-dir", type=str, default="powerbi/exports", help="Directory for Power BI exports")
    args = parser.parse_args()

    aggregator = SummaryAggregator()

    if args.refresh:
        aggregator.refresh_materialized_views()

    if args.export_powerbi:
        aggregator.export_powerbi_datasets(args.output_dir)

    if not args.refresh and not args.export_powerbi:
        logging.info("Executing summary aggregation statistics computation demo...")
        student_df = aggregator.fetch_student_analytics()
        module_df = aggregator.fetch_module_analytics()
        
        score_stats = aggregator.calculate_summary_statistics(student_df, "mean_assessment_score")
        att_stats = aggregator.calculate_summary_statistics(student_df, "mean_attendance_rate")
        corr = aggregator.calculate_attendance_score_correlation(student_df)

        print("\n" + "=" * 60)
        print("  UNIPULSE STATISTICAL SUMMARY ENGINE DEMO")
        print("=" * 60)
        print(f"  ✓ Mean Assessment Score : {score_stats['mean']:.2f} (StdDev: {score_stats['std']:.2f})")
        print(f"  ✓ Mean Attendance Rate  : {att_stats['mean']:.2f}% (StdDev: {att_stats['std']:.2f})")
        print(f"  ✓ Attendance Correlation : r = {corr:.4f}")
        print(f"  ✓ Total Student Records : {len(student_df)}")
        print(f"  ✓ Total Module Summaries: {len(module_df)}")
        print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
