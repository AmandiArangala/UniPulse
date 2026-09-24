# 🎓 UniPulse Python ETL Pipeline (Data Engine & Star Schema)

The UniPulse Python ETL pipeline (`etl_pipeline.py`) transforms operational OLTP records (`unipulse_core`) into analytical dimensional tables and central fact tables (`unipulse_analytics.fact_performance`) using **Pandas** and **SQLAlchemy**.

---

## 🛠️ Tech Stack & Architecture

- **Engine**: Python 3.12, Pandas 2.2+, NumPy 1.26+, SQLAlchemy 2.0+
- **Database**: PostgreSQL 16 / Supabase
- **Source Schema**: `unipulse_core`
- **Target Schema**: `unipulse_analytics` (Star Schema Data Warehouse)

---

## 🚀 Key Features

1. **SQLAlchemy Connection Engine**: Connection pooling, automatic pre-ping health checks, and environment variable loading (`DATABASE_URL`).
2. **Pandas Data Extraction & Cleaning**:
   - Imputes missing scores, GPAs, and credit metrics.
   - Normalizes assessment percentage scores and clips values strictly to `[0.0, 100.0]`.
   - Removes duplicate records using natural business keys.
3. **Feature Engineering & Transformation Engine**:
   - Calculates weighted average assessment scores per student and module.
   - Computes rolling performance trajectory slopes using **NumPy linear regression**.
   - Calculates module attendance rates ($\text{PRESENT} + 0.5 \times \text{LATE}$) and submission completion rates.
   - Computes composite **Academic Health Score** ($40\%$ performance, $20\%$ attendance, $15\%$ submissions, $15\%$ engagement, $10\%$ trend slope).
   - Categorizes risk attention levels (`EXCELLENT`, `SATISFACTORY`, `ATTENTION_REQUIRED`, `CRITICAL`).
34. **Summary Aggregation & EDA Views Engine**:
   - Materialized summary views (`student_analytics`, `module_analytics`, `semester_analytics`) calculating Mean, Standard Deviation (`std`), Pass Rates (% passed >= 50%), and Pearson Attendance Correlation ($r$).
   - Statistical aggregator module (`summary_aggregator.py`) supporting automatic materialized view refreshes and direct Power BI dataset export (`powerbi/exports/`).
   - Exploratory Data Analysis (EDA) Jupyter Notebook (`analytics/notebooks/eda_summary_analytics.ipynb`) featuring statistical distributions, pass rate comparisons, regression plots, and summary tables.

---

## 💻 Execution Commands

### 1. Run Full ETL Pipeline
```powershell
python analytics/src/etl_pipeline.py
```

### 2. Refresh Summary Aggregation Views & Export Power BI Datasets
```powershell
python analytics/src/summary_aggregator.py --refresh --export-powerbi
```

### 3. Generate EDA Jupyter Notebook
```powershell
python analytics/src/generate_eda_notebook.py
```

### 4. Run Automated Summary Aggregation Unit Tests
```powershell
python -m unittest analytics/src/test_summary_aggregation.py
```

---

## 📊 CLI Options

| Flag | Description | Default |
| :--- | :--- | :--- |
| `--db-url` | Target database connection string | `DATABASE_URL` env variable |
| `--rebuild` | Purges target analytics tables prior to load | `False` |
| `--batch-size` | Batch size for bulk upserts | `5000` |
| `--log-level` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |
| `--export-powerbi` | Exports clean CSV datasets for Power BI ingestion | `False` |

