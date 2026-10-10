// ============================================================================
// UniPulse Enterprise Power BI Power Query (M Language) Data Transformations
// Target Engine: PostgreSQL 16 Data Warehouse (unipulse_analytics schema)
// ============================================================================

section UniPulsePowerQueryTransformations;

// ----------------------------------------------------------------------------
// 1. FactPerformance Table Data Ingestion & Data Typing
// ----------------------------------------------------------------------------
shared fact_performance = let
    Source = PostgreSQL.Database("localhost", "unipulse_db", [CreateNavigationProperties=false]),
    unipulse_analytics_Schema = Source{[Schema="unipulse_analytics"]}[Data],
    fact_performance_Table = unipulse_analytics_Schema{[Name="fact_performance"]}[Data],
    TransformedTypes = Table.TransformColumnTypes(fact_performance_Table,{
        {"fact_id", type text},
        {"student_key", type text},
        {"module_key", type text},
        {"semester_key", type text},
        {"program_key", type text},
        {"date_key", type date},
        {"scores", type number},
        {"attendance_rate", type number},
        {"submission_rate", type number},
        {"engagement_score", type number},
        {"final_grade", type number},
        {"health_score", type number},
        {"attention_level", type text},
        {"created_at", type datetimezone},
        {"updated_at", type datetimezone}
    })
in
    TransformedTypes;

// ----------------------------------------------------------------------------
// 2. DimStudent Dimension Ingestion
// ----------------------------------------------------------------------------
shared dim_student = let
    Source = PostgreSQL.Database("localhost", "unipulse_db", [CreateNavigationProperties=false]),
    unipulse_analytics_Schema = Source{[Schema="unipulse_analytics"]}[Data],
    dim_student_Table = unipulse_analytics_Schema{[Name="dim_student"]}[Data],
    TransformedTypes = Table.TransformColumnTypes(dim_student_Table,{
        {"student_key", type text},
        {"student_number", type text},
        {"full_name", type text},
        {"email", type text},
        {"program_name", type text},
        {"department_name", type text},
        {"faculty_name", type text},
        {"enrollment_year", Int64.Type},
        {"current_gpa", type number},
        {"academic_status", type text},
        {"updated_at", type datetimezone}
    })
in
    TransformedTypes;

// ----------------------------------------------------------------------------
// 3. DimModule Dimension Ingestion
// ----------------------------------------------------------------------------
shared dim_module = let
    Source = PostgreSQL.Database("localhost", "unipulse_db", [CreateNavigationProperties=false]),
    unipulse_analytics_Schema = Source{[Schema="unipulse_analytics"]}[Data],
    dim_module_Table = unipulse_analytics_Schema{[Name="dim_module"]}[Data],
    TransformedTypes = Table.TransformColumnTypes(dim_module_Table,{
        {"module_key", type text},
        {"module_code", type text},
        {"module_title", type text},
        {"credit_hours", Int64.Type},
        {"department_name", type text},
        {"faculty_name", type text},
        {"updated_at", type datetimezone}
    })
in
    TransformedTypes;

// ----------------------------------------------------------------------------
// 4. DimSemester Dimension Ingestion
// ----------------------------------------------------------------------------
shared dim_semester = let
    Source = PostgreSQL.Database("localhost", "unipulse_db", [CreateNavigationProperties=false]),
    unipulse_analytics_Schema = Source{[Schema="unipulse_analytics"]}[Data],
    dim_semester_Table = unipulse_analytics_Schema{[Name="dim_semester"]}[Data],
    TransformedTypes = Table.TransformColumnTypes(dim_semester_Table,{
        {"semester_key", type text},
        {"semester_name", type text},
        {"academic_year", Int64.Type},
        {"start_date", type date},
        {"end_date", type date},
        {"is_current", type logical},
        {"updated_at", type datetimezone}
    })
in
    TransformedTypes;

// ----------------------------------------------------------------------------
// 5. DimProgram Dimension Ingestion
// ----------------------------------------------------------------------------
shared dim_program = let
    Source = PostgreSQL.Database("localhost", "unipulse_db", [CreateNavigationProperties=false]),
    unipulse_analytics_Schema = Source{[Schema="unipulse_analytics"]}[Data],
    dim_program_Table = unipulse_analytics_Schema{[Name="dim_program"]}[Data],
    TransformedTypes = Table.TransformColumnTypes(dim_program_Table,{
        {"program_key", type text},
        {"program_code", type text},
        {"program_name", type text},
        {"degree_level", type text},
        {"department_name", type text},
        {"faculty_name", type text},
        {"total_credits", Int64.Type},
        {"created_at", type datetimezone}
    })
in
    TransformedTypes;

// ----------------------------------------------------------------------------
// 6. DimDate Temporal Dimension Ingestion
// ----------------------------------------------------------------------------
shared dim_date = let
    Source = PostgreSQL.Database("localhost", "unipulse_db", [CreateNavigationProperties=false]),
    unipulse_analytics_Schema = Source{[Schema="unipulse_analytics"]}[Data],
    dim_date_Table = unipulse_analytics_Schema{[Name="dim_date"]}[Data],
    TransformedTypes = Table.TransformColumnTypes(dim_date_Table,{
        {"date_key", type date},
        {"year", Int64.Type},
        {"quarter", Int64.Type},
        {"month", Int64.Type},
        {"month_name", type text},
        {"day", Int64.Type},
        {"day_of_week", type text},
        {"is_weekend", type logical},
        {"academic_week", Int64.Type},
        {"created_at", type datetimezone}
    })
in
    TransformedTypes;
