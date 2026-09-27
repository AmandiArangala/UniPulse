import { apiClient } from './axios';
import {
  AttentionIndicatorResult,
  AttentionSimulationRequest,
  AttentionTriggerDetail,
  AttentionCategoryTier,
} from '../types/attentionIndicator';

// Helper function to calculate client-side attention score as fallback
export function calculateClientAttention(req: AttentionSimulationRequest): AttentionIndicatorResult {
  const attendanceRate = req.attendanceRate ?? 84;
  const averageMark = req.averageMark ?? 76;
  const missedTestsCount = req.missedTestsCount ?? 0;
  const trendSlope = req.trendSlope ?? 'IMPROVING';
  const engagementScore = req.engagementScore ?? 71;

  let score = 0;
  const triggerDetails: AttentionTriggerDetail[] = [];

  // Rule 1: Attendance < 60% (+30)
  const triggerAttn = attendanceRate < 60;
  if (triggerAttn) score += 30;
  triggerDetails.push({
    ruleCode: 'ATTN_BELOW_60',
    ruleName: 'Low Attendance Rate',
    triggered: triggerAttn,
    pointsAssigned: triggerAttn ? 30 : 0,
    maxPoints: 30,
    thresholdDescription: 'Attendance rate drops below 60%',
    actualValue: `${attendanceRate.toFixed(1)}%`,
    diagnosticExplanation: triggerAttn
      ? `Attendance (${attendanceRate.toFixed(1)}%) is under critical compliance threshold of 60%.`
      : `Attendance (${attendanceRate.toFixed(1)}%) satisfies compliance threshold (>= 60%).`,
    recommendedAction: triggerAttn
      ? 'Schedule attendance consultation and offer recorded lecture catch-up resources.'
      : 'Maintain current lecture attendance rhythm.',
  });

  // Rule 2: Average Mark < 50% (+30)
  const triggerAvg = averageMark < 50;
  if (triggerAvg) score += 30;
  triggerDetails.push({
    ruleCode: 'AVG_BELOW_50',
    ruleName: 'Low Average Mark',
    triggered: triggerAvg,
    pointsAssigned: triggerAvg ? 30 : 0,
    maxPoints: 30,
    thresholdDescription: 'Overall assessment average drops below 50%',
    actualValue: `${averageMark.toFixed(1)}%`,
    diagnosticExplanation: triggerAvg
      ? `Overall assessment average (${averageMark.toFixed(1)}%) is under passing benchmark (50%).`
      : `Overall assessment average (${averageMark.toFixed(1)}%) exceeds benchmark (>= 50%).`,
    recommendedAction: triggerAvg
      ? 'Recommend subject tutoring, assignment revisions, and peer study groups.'
      : 'Continue steady academic preparation.',
  });

  // Rule 3: Missed Tests >= 2 (+20)
  const triggerMissed = missedTestsCount >= 2;
  if (triggerMissed) score += 20;
  triggerDetails.push({
    ruleCode: 'MISSED_TESTS_GE_2',
    ruleName: 'Multiple Missed Assessments',
    triggered: triggerMissed,
    pointsAssigned: triggerMissed ? 20 : 0,
    maxPoints: 20,
    thresholdDescription: 'Missed tests or mandatory submissions count >= 2',
    actualValue: `${missedTestsCount} missed test(s)`,
    diagnosticExplanation: triggerMissed
      ? `Accumulated ${missedTestsCount} missed assessment(s), exceeding tolerance limit of 1.`
      : `Missed assessment count (${missedTestsCount}) is within acceptable limit.`,
    recommendedAction: triggerMissed
      ? 'Verify missing assessment excuses, allow make-up submissions, or adjust deadlines.'
      : 'No missed test intervention required.',
  });

  // Rule 4: Declining Trend (+10)
  const triggerTrend = trendSlope === 'DECLINING';
  if (triggerTrend) score += 10;
  triggerDetails.push({
    ruleCode: 'DECLINING_TREND',
    ruleName: 'Declining Trajectory',
    triggered: triggerTrend,
    pointsAssigned: triggerTrend ? 10 : 0,
    maxPoints: 10,
    thresholdDescription: 'Assessment score trend slope is declining across recent modules',
    actualValue: `Trend: ${trendSlope}`,
    diagnosticExplanation: triggerTrend
      ? 'Performance trajectory indicates a downward slope over consecutive evaluations.'
      : `Performance trajectory is stable or improving (${trendSlope}).`,
    recommendedAction: triggerTrend
      ? 'Conduct check-in interview to identify external obstacles or workload burnout.'
      : 'Maintain positive learning momentum.',
  });

  // Rule 5: Low Engagement < 50% (+10)
  const triggerEngage = engagementScore < 50;
  if (triggerEngage) score += 10;
  triggerDetails.push({
    ruleCode: 'LOW_ENGAGEMENT',
    ruleName: 'Low LMS Engagement',
    triggered: triggerEngage,
    pointsAssigned: triggerEngage ? 10 : 0,
    maxPoints: 10,
    thresholdDescription: 'LMS resource activity and engagement score < 50%',
    actualValue: `${engagementScore.toFixed(1)}%`,
    diagnosticExplanation: triggerEngage
      ? `LMS engagement index (${engagementScore.toFixed(1)}%) is under active threshold (50%).`
      : `LMS engagement index (${engagementScore.toFixed(1)}%) shows active participation.`,
    recommendedAction: triggerEngage
      ? 'Encourage participation in interactive discussion forums and digital learning modules.'
      : 'Sustain high platform engagement.',
  });

  let categoryTier: AttentionCategoryTier = 'LOW_ATTENTION';
  let badgeLabel = 'Good Standing';
  let badgeColor = 'emerald';

  if (score >= 60) {
    categoryTier = 'HIGH_ATTENTION';
    badgeLabel = 'Priority Support Recommended';
    badgeColor = 'rose';
  } else if (score >= 30) {
    categoryTier = 'MEDIUM_ATTENTION';
    badgeLabel = 'Moderate Focus Needed';
    badgeColor = 'amber';
  }

  const triggeredCount = triggerDetails.filter((t) => t.triggered).length;
  const summaryDiagnostic =
    triggeredCount === 0
      ? `Student demonstrates strong performance with 0 triggered risk factors (Score: ${score}/100).`
      : `Attention score calculated at ${score}/100 (${categoryTier}) due to ${triggeredCount} triggered risk condition(s).`;

  const advisorDiagnosticNote =
    score >= 60
      ? `ADVISOR DECISION SUPPORT: High attention score (${score}/100). Urgent multi-dimensional academic support recommended. Priority review for attendance, remedial tutoring, and milestone tracking.`
      : score >= 30
      ? `ADVISOR DECISION SUPPORT: Moderate attention score (${score}/100). Recommend scheduling a brief advisory check-in to review study habits.`
      : `ADVISOR DECISION SUPPORT: Low attention score (${score}/100). Student in good standing. Standard periodic check-in recommended.`;

  const lecturerDiagnosticNote =
    score >= 60
      ? `LECTURER DECISION SUPPORT: High attention flagged. Monitor attendance records, offer makeup assessment options if eligible, and coordinate with academic advisor.`
      : score >= 30
      ? `LECTURER DECISION SUPPORT: Flagged for moderate focus. Monitor upcoming quiz/lab submissions and offer office hour consultation.`
      : `LECTURER DECISION SUPPORT: Student performing well in module coursework. No immediate classroom intervention required.`;

  const recommendedInterventions = triggerDetails
    .filter((t) => t.triggered)
    .map((t) => t.recommendedAction);

  if (recommendedInterventions.length === 0) {
    recommendedInterventions.push('No corrective interventions required. Student is on track for high academic achievement.');
  }

  return {
    studentId: req.studentId || 'std-demo-123',
    studentName: 'Alex Mercer',
    studentNumber: 'STU-2024-8841',
    programName: 'BSc Computer Science & Data Analytics',
    totalAttentionScore: score,
    categoryTier,
    badgeLabel,
    badgeColor,
    summaryDiagnostic,
    advisorDiagnosticNote,
    lecturerDiagnosticNote,
    triggerDetails,
    recommendedInterventions,
    evaluatedAt: new Date().toISOString(),
  };
}

export const attentionIndicatorService = {
  async getStudentAttentionIndicator(studentId: string): Promise<AttentionIndicatorResult> {
    try {
      const response = await apiClient.get(`/api/v1/academic-intelligence/attention-indicator/student/${studentId}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {
      console.warn('Backend endpoint unavailable, using client rule engine fallback for attention indicator:', e);
    }
    return calculateClientAttention({ studentId });
  },

  async simulateAttentionIndicator(request: AttentionSimulationRequest): Promise<AttentionIndicatorResult> {
    try {
      const response = await apiClient.post('/api/v1/academic-intelligence/attention-indicator/simulate', request);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {
      console.warn('Backend endpoint unavailable, using client simulation rule engine fallback:', e);
    }
    return calculateClientAttention(request);
  },

  async evaluateBatchAttention(studentIds: string[]): Promise<AttentionIndicatorResult[]> {
    try {
      const response = await apiClient.post('/api/v1/academic-intelligence/attention-indicator/batch', studentIds);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (e) {
      console.warn('Backend batch endpoint unavailable, using client fallback:', e);
    }
    return studentIds.map((id) => calculateClientAttention({ studentId: id }));
  },
};
