export type AttentionCategoryTier = 'LOW_ATTENTION' | 'MEDIUM_ATTENTION' | 'HIGH_ATTENTION';

export interface AttentionTriggerDetail {
  ruleCode: string;
  ruleName: string;
  triggered: boolean;
  pointsAssigned: number;
  maxPoints: number;
  thresholdDescription: string;
  actualValue: string;
  diagnosticExplanation: string;
  recommendedAction: string;
}

export interface AttentionIndicatorResult {
  studentId: string;
  studentName: string;
  studentNumber: string;
  programName: string;

  totalAttentionScore: number; // 0 - 100
  categoryTier: AttentionCategoryTier;
  badgeLabel: string; // Non-stigmatizing text e.g., "Good Standing", "Moderate Focus Needed"
  badgeColor: 'emerald' | 'amber' | 'rose' | string;

  summaryDiagnostic: string;
  advisorDiagnosticNote: string;
  lecturerDiagnosticNote: string;

  triggerDetails: AttentionTriggerDetail[];
  recommendedInterventions: string[];

  evaluatedAt: string;
}

export interface AttentionSimulationRequest {
  studentId?: string;
  attendanceRate?: number;
  averageMark?: number;
  missedTestsCount?: number;
  trendSlope?: 'IMPROVING' | 'STABLE' | 'DECLINING';
  engagementScore?: number;
}
