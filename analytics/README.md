# 🎓 UniPulse Python ETL Pipeline (Phase 4: Data Engine & Star Schema)

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
4. **Idempotent Bulk Loading (`load()`)**:
   - Transaction-managed batch loading into dimension tables (`dim_date`, `dim_program`, `dim_student`, `dim_module`, `dim_semester`).
   - Idempotent upserts on `fact_performance` using `ON CONFLICT (student_key, module_key, semester_key) DO UPDATE`.
   - `--rebuild` mode to purge analytical tables prior to loading.

---

## 💻 Execution Commands

### 1. Run Full ETL Pipeline
```powershell
python analytics/src/etl_pipeline.py
```

### 2. Run ETL Pipeline with Rebuild (Purge & Re-index)
```powershell
python analytics/src/etl_pipeline.py --rebuild
```

### 3. Run Automated Unit & Integration Tests
```powershell
python analytics/src/test_etl_pipeline.py
```

---

## 📊 CLI Options

| Flag | Description | Default |
| :--- | :--- | :--- |
| `--db-url` | Target database connection string | `DATABASE_URL` env variable |
| `--rebuild` | Purges target analytics tables prior to load | `False` |
| `--batch-size` | Batch size for bulk upserts | `5000` |
| `--log-level` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |
