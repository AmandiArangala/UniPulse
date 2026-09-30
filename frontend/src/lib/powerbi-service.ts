import { apiClient } from './axios';
import { PowerBISemanticModel, DAXMeasure, StarSchemaRelationship } from '@/types/powerbi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const mockDAXMeasures: DAXMeasure[] = [
  {
    measureKey: 'avg_gpa',
    name: '[Avg GPA]',
    daxFormula: "AVERAGE('dim_student'[current_gpa])",
    calculatedValue: 3.42,
    unit: 'GPA',
    category: 'Academic Performance',
    description: 'Average Cumulative GPA across student cohort dimension.',
    sqlEquivalent: 'AVG(ds.current_gpa)',
    varianceFromTarget: 0.42,
    statusIndicator: 'SATISFACTORY',
  },
  {
    measureKey: 'pass_rate_pct',
    name: '[Pass Rate %]',
    daxFormula: "DIVIDE(COUNTROWS(FILTER('fact_performance', 'fact_performance'[scores] >= 50.0)), COUNTROWS('fact_performance'), 0) * 100",
    calculatedValue: 88.5,
    unit: '%',
    category: 'Academic Performance',
    description: 'Percentage of module enrollments resulting in passing grades (>= 50%).',
    sqlEquivalent: '100.0 * SUM(CASE WHEN scores >= 50 THEN 1 ELSE 0 END) / COUNT(*)',
    varianceFromTarget: 8.5,
    statusIndicator: 'SATISFACTORY',
  },
  {
    measureKey: 'attendance_pct',
    name: '[Attendance %]',
    daxFormula: "AVERAGE('fact_performance'[attendance_rate])",
    calculatedValue: 84.2,
    unit: '%',
    category: 'Behavioral Engagement',
    description: 'Mean lecture and lab attendance rate across modules.',
    sqlEquivalent: 'AVG(fp.attendance_rate)',
    varianceFromTarget: 9.2,
    statusIndicator: 'SATISFACTORY',
  },
  {
    measureKey: 'high_risk_count',
    name: '[High Risk Count]',
    daxFormula: "CALCULATE(DISTINCTCOUNT('fact_performance'[student_key]), 'fact_performance'[attention_level] IN { \"CRITICAL\", \"ATTENTION_REQUIRED\" })",
    calculatedValue: 14,
    unit: 'Students',
    category: 'Risk Analytics',
    description: 'Count of unique students flagged in CRITICAL or ATTENTION_REQUIRED state.',
    sqlEquivalent: "COUNT(DISTINCT CASE WHEN attention_level IN ('CRITICAL', 'ATTENTION_REQUIRED') THEN student_key END)",
    varianceFromTarget: 6,
    statusIndicator: 'SATISFACTORY',
  },
  {
    measureKey: 'intervention_success_rate_pct',
    name: '[Intervention Success Rate %]',
    daxFormula: "DIVIDE(COUNTROWS(FILTER('fact_performance', 'fact_performance'[intervention_status] IN { \"SUCCESSFUL\", \"RESOLVED\" })), COUNTROWS(FILTER('fact_performance', NOT ISBLANK('fact_performance'[intervention_status]))), 0) * 100",
    calculatedValue: 76.4,
    unit: '%',
    category: 'Risk Analytics',
    description: 'Percentage of flagged students successfully restored to satisfactory standing following academic intervention.',
    sqlEquivalent: "100.0 * SUM(CASE WHEN intervention_status = 'SUCCESSFUL' THEN 1 ELSE 0 END) / COUNT(intervention_status)",
    varianceFromTarget: 6.4,
    statusIndicator: 'SATISFACTORY',
  },
  {
    measureKey: 'pearson_correlation_r',
    name: '[Attendance-Performance Pearson r]',
    daxFormula: "VAR AvgAtt = AVERAGE('fact_performance'[attendance_rate]) VAR AvgScore = AVERAGE('fact_performance'[scores]) RETURN DIVIDE(SUMX(...), SQRT(...), 0)",
    calculatedValue: 0.785,
    unit: 'r',
    category: 'Statistical Modeling',
    description: 'Pearson correlation coefficient measuring relationship between attendance and assessment scores.',
    sqlEquivalent: 'CORR(fp.attendance_rate, fp.scores)',
    varianceFromTarget: 0.285,
    statusIndicator: 'SATISFACTORY',
  },
  {
    measureKey: 'academic_health_index',
    name: '[Academic Health Index]',
    daxFormula: "AVERAGE('fact_performance'[health_score])",
    calculatedValue: 82.1,
    unit: 'Index',
    category: 'Composite Index',
    description: 'Composite institutional health score combining attendance, grades, and submission rates.',
    sqlEquivalent: 'AVG(fp.health_score)',
    varianceFromTarget: 7.1,
    statusIndicator: 'SATISFACTORY',
  },
];

export const mockStarSchemaRelationships: StarSchemaRelationship[] = [
  {
    id: 'rel_student_fact',
    fromTable: 'dim_student',
    fromColumn: 'student_key',
    toTable: 'fact_performance',
    toColumn: 'student_key',
    cardinality: 'ONE_TO_MANY',
    filterDirection: 'SINGLE_DIRECTIONAL',
    isActive: true,
    description: '1-to-many relationship filtering performance records by student demographics.',
  },
  {
    id: 'rel_module_fact',
    fromTable: 'dim_module',
    fromColumn: 'module_key',
    toTable: 'fact_performance',
    toColumn: 'module_key',
    cardinality: 'ONE_TO_MANY',
    filterDirection: 'SINGLE_DIRECTIONAL',
    isActive: true,
    description: '1-to-many relationship filtering performance records by course module.',
  },
  {
    id: 'rel_semester_fact',
    fromTable: 'dim_semester',
    fromColumn: 'semester_key',
    toTable: 'fact_performance',
    toColumn: 'semester_key',
    cardinality: 'ONE_TO_MANY',
    filterDirection: 'SINGLE_DIRECTIONAL',
    isActive: true,
    description: '1-to-many relationship filtering performance records by academic semester term.',
  },
  {
    id: 'rel_program_fact',
    fromTable: 'dim_program',
    fromColumn: 'program_key',
    toTable: 'fact_performance',
    toColumn: 'program_key',
    cardinality: 'ONE_TO_MANY',
    filterDirection: 'SINGLE_DIRECTIONAL',
    isActive: true,
    description: '1-to-many relationship filtering performance records by degree program hierarchy.',
  },
  {
    id: 'rel_date_fact',
    fromTable: 'dim_date',
    fromColumn: 'date_key',
    toTable: 'fact_performance',
    toColumn: 'date_key',
    cardinality: 'ONE_TO_MANY',
    filterDirection: 'SINGLE_DIRECTIONAL',
    isActive: true,
    description: '1-to-many relationship for temporal time-series OLAP aggregation.',
  },
];

export const mockPowerBISemanticModel: PowerBISemanticModel = {
  modelName: 'UniPulse Enterprise Semantic Model',
  targetWarehouse: 'PostgreSQL 16 (unipulse_analytics)',
  databaseSchema: 'unipulse_analytics',
  totalFactRecords: 1250,
  daxMeasures: mockDAXMeasures,
  relationships: mockStarSchemaRelationships,
  dimensionTables: ['dim_student', 'dim_module', 'dim_semester', 'dim_program', 'dim_date'],
  factTable: 'fact_performance',
  lastRefreshedAt: new Date().toISOString(),
};

export const powerBIService = {
  async getSemanticModel(semester?: string, faculty?: string): Promise<PowerBISemanticModel> {
    try {
      const res = await apiClient.get<ApiResponse<PowerBISemanticModel>>('/api/v1/analytics/powerbi/semantic-model', {
        params: { semester: semester || 'ALL', faculty: faculty || 'ALL' },
      });
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return mockPowerBISemanticModel;
    } catch {
      return mockPowerBISemanticModel;
    }
  },

  async getDAXMeasures(semester?: string, faculty?: string): Promise<DAXMeasure[]> {
    try {
      const res = await apiClient.get<ApiResponse<DAXMeasure[]>>('/api/v1/analytics/powerbi/dax-measures', {
        params: { semester: semester || 'ALL', faculty: faculty || 'ALL' },
      });
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
      return mockDAXMeasures;
    } catch {
      return mockDAXMeasures;
    }
  },

  async getStarSchemaRelationships(): Promise<StarSchemaRelationship[]> {
    try {
      const res = await apiClient.get<ApiResponse<StarSchemaRelationship[]>>('/api/v1/analytics/powerbi/star-schema');
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
      return mockStarSchemaRelationships;
    } catch {
      return mockStarSchemaRelationships;
    }
  },
};
