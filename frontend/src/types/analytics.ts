export type RiskStatus = 'GOOD_STANDING' | 'ATTENTION_NEEDED' | 'CRITICAL_RISK';

export interface AnalyticsFilterState {
  department: string;
  semester: string;
  academicYear: string;
  riskStatus: string;
  searchTerm: string;
}

export interface ExecutiveKPIs {
  totalStudents: number;
  totalStudentsChangePct: number;
  averageGpa: number;
  averageGpaChangePct: number;
  attendanceRatePct: number;
  attendanceRateChangePct: number;
  atRiskCount: number;
  atRiskChangePct: number;
  retentionRatePct: number;
  retentionRateChangePct: number;
  courseCompletionRatePct: number;
  courseCompletionRateChangePct: number;
}

export interface AttentionDistribution {
  category: RiskStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GPATrendPoint {
  semester: string;
  overallGpa: number;
  targetBenchmark: number;
  computerScienceGpa: number;
  softwareEngGpa: number;
  dataScienceGpa: number;
  cybersecurityGpa: number;
}

export interface GradeDistributionItem {
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
  gradePoint: number;
  count: number;
  percentage: number;
  color: string;
}

export interface ProgramRankingItem {
  programId: string;
  programName: string;
  department: string;
  totalEnrolled: number;
  meanGpa: number;
  passRatePct: number;
  atRiskRatePct: number;
  status: 'EXCELLENT' | 'STABLE' | 'NEEDS_ATTENTION';
  rank: number;
}

export interface CohortComparisonItem {
  semesterLabel: string;
  cohort2022: number;
  cohort2023: number;
  cohort2024: number;
  cohort2025: number;
}

export interface ScatterPointData {
  id: string;
  studentName: string;
  studentId: string;
  department: string;
  attendancePct: number;
  examMarksPct: number;
  gpa: number;
  riskStatus: RiskStatus;
}

export interface RegressionResults {
  slope: number;
  intercept: number;
  r2: number;
  r: number;
  pValText: string;
  trendLinePoints: { x: number; y: number }[];
}

export interface DropOffDataPoint {
  semester: string;
  enrolled: number;
  retained: number;
  retentionRatePct: number;
  dropOutCount: number;
  dropOutRatePct: number;
}

export interface ProgramModuleSummary {
  code: string;
  name: string;
  avgScore: number;
  passRatePct: number;
}

export interface AtRiskStudentSummary {
  id: string;
  name: string;
  gpa: number;
  attendancePct: number;
  riskLevel: RiskStatus;
}

export interface ProgramDetailDrillThrough {
  program: ProgramRankingItem;
  topModules: ProgramModuleSummary[];
  atRiskStudents: AtRiskStudentSummary[];
  gpaDistribution: GradeDistributionItem[];
}

export interface DashboardAnalyticsData {
  kpis: ExecutiveKPIs;
  attentionDistribution: AttentionDistribution[];
  gpaTrends: GPATrendPoint[];
  gradeDistribution: GradeDistributionItem[];
  programRankings: ProgramRankingItem[];
  cohortComparisons: CohortComparisonItem[];
  scatterData: ScatterPointData[];
  regression: RegressionResults;
  dropOffCurves: DropOffDataPoint[];
}
