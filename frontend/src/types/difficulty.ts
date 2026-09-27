export interface TopicMasteryGapItem {
  topicId: string;
  topicName: string;
  assessmentCount: number;
  averageScorePercentage: number;
  studentPassPercentage: number;
  masteryGapPercentage: number;
  difficultyRating: 'WELL_MASTERED' | 'MODERATE' | 'CHALLENGING' | 'CRITICAL_GAP';
  recommendation: string;
}

export interface AssessmentDifficultyItem {
  assessmentId: string;
  assessmentName: string;
  moduleCode: string;
  moduleTitle: string;
  weightage: number;
  totalStudentsEvaluated: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  failureRate: number;
  passRate: number;
  difficultyBand: 'EASY' | 'MODERATE' | 'HARD' | 'CRITICAL';
  topicMasteryGaps: TopicMasteryGapItem[];
}

export interface ModuleDifficultyIndexItem {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  totalEnrolled: number;
  failureRate: number;
  meanFinalMark: number;
  repeatRate: number;
  withdrawalRate: number;
  difficultyIndexScore: number;
  difficultyBand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL_DIFFICULTY';
  summaryInsight: string;
  assessments: AssessmentDifficultyItem[];
  topicDiagnostics: TopicMasteryGapItem[];
}
