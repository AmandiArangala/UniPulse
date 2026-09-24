'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  Info,
  Layers,
  BarChart2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export interface AcademicMetrics {
  gpa: number;
  attendanceRate: number; // 0-100
  assessmentAvg: number; // 0-100
  submissionRate: number; // 0-100
  engagementScore: number; // 0-100
  creditsCompleted: number;
  totalCredits: number;
  trendSlope: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

interface AcademicProgressTwinProps {
  initialMetrics?: AcademicMetrics;
  studentName?: string;
  studentId?: string;
  programName?: string;
}

const DEFAULT_METRICS: AcademicMetrics = {
  gpa: 3.42,
  attendanceRate: 84,
  assessmentAvg: 76,
  submissionRate: 92,
  engagementScore: 71,
  creditsCompleted: 64,
  totalCredits: 120,
  trendSlope: 'IMPROVING',
};

// Weight definitions for explainable score algorithm
const WEIGHTS = {
  academicPerformance: 0.4, // 40%
  attendance: 0.2, // 20%
  submissions: 0.15, // 15%
  engagement: 0.15, // 15%
  trend: 0.1, // 10%
};

export function AcademicProgressTwin({
  initialMetrics = DEFAULT_METRICS,
  studentName = 'Alex Mercer',
  studentId = 'STU-2026-8941',
  programName = 'BSc Computer Science & Data Analytics',
}: AcademicProgressTwinProps) {
  const [metrics, setMetrics] = useState<AcademicMetrics>(initialMetrics);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showExplainability, setShowExplainability] = useState(false);

  // Calculate Explainable Health Score
  const healthCalculation = useMemo(() => {
    // Academic performance derived from GPA (scale 4.0 to 100) & assessment average
    const gpaPercent = (metrics.gpa / 4.0) * 100;
    const academicPerformanceScore = gpaPercent * 0.5 + metrics.assessmentAvg * 0.5;

    // Trend Score
    const trendScore =
      metrics.trendSlope === 'IMPROVING' ? 95 : metrics.trendSlope === 'STABLE' ? 75 : 45;

    // Weighted factors
    const perfContrib = academicPerformanceScore * WEIGHTS.academicPerformance;
    const attContrib = metrics.attendanceRate * WEIGHTS.attendance;
    const subContrib = metrics.submissionRate * WEIGHTS.submissions;
    const engContrib = metrics.engagementScore * WEIGHTS.engagement;
    const trendContrib = trendScore * WEIGHTS.trend;

    const totalScore = Math.round(perfContrib + attContrib + subContrib + engContrib + trendContrib);

    // Score tier & color coding
    let statusTier: 'EXCELLENT' | 'HEALTHY' | 'ATTENTION' | 'CRITICAL' = 'HEALTHY';
    let statusColor = 'text-emerald-600 dark:text-emerald-400';
    let ringColor = 'stroke-emerald-500';
    let bgTint = 'bg-emerald-50/50 dark:bg-emerald-950/20';

    if (totalScore >= 85) {
      statusTier = 'EXCELLENT';
      statusColor = 'text-indigo-600 dark:text-indigo-400';
      ringColor = 'stroke-indigo-600';
      bgTint = 'bg-indigo-50/50 dark:bg-indigo-950/20';
    } else if (totalScore >= 70) {
      statusTier = 'HEALTHY';
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      ringColor = 'stroke-emerald-500';
      bgTint = 'bg-emerald-50/50 dark:bg-emerald-950/20';
    } else if (totalScore >= 55) {
      statusTier = 'ATTENTION';
      statusColor = 'text-amber-600 dark:text-amber-400';
      ringColor = 'stroke-amber-500';
      bgTint = 'bg-amber-50/50 dark:bg-amber-950/20';
    } else {
      statusTier = 'CRITICAL';
      statusColor = 'text-rose-600 dark:text-rose-400';
      ringColor = 'stroke-rose-500';
      bgTint = 'bg-rose-50/50 dark:bg-rose-950/20';
    }

    return {
      totalScore,
      statusTier,
      statusColor,
      ringColor,
      bgTint,
      academicPerformanceScore,
      perfContrib,
      attContrib,
      subContrib,
      engContrib,
      trendContrib,
    };
  }, [metrics]);

  const handleReset = () => {
    setMetrics(initialMetrics);
  };

  // Recommendations based on metrics
  const recommendations = useMemo(() => {
    const list = [];
    if (metrics.attendanceRate < 80) {
      list.push({
        type: 'warning',
        title: 'Attendance Alert',
        message: 'Attendance is below target 80%. Attending the next 4 lectures will improve Health Score by +3.2 pts.',
      });
    } else {
      list.push({
        type: 'success',
        title: 'Strong Attendance Record',
        message: 'Maintaining >80% attendance protects your eligibility for final honours classification.',
      });
    }

    if (metrics.submissionRate < 90) {
      list.push({
        type: 'warning',
        title: 'Submission Consistency',
        message: 'You have 1 pending submission due in 48 hours. Completing it on time maintains your +13.8 pt submission pillar.',
      });
    }

    if (metrics.assessmentAvg >= 75) {
      list.push({
        type: 'info',
        title: 'Academic Milestone',
        message: `Current assessment average (${metrics.assessmentAvg}%) puts you on track for First Class Distinction.`,
      });
    }

    return list;
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Profile & Twin Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Digital Academic Progress Twin • Real-time Mirror</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {studentName}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              {studentId} • {programName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center space-x-2 shadow-md ${
                isSimulating
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{isSimulating ? 'Exit Interactive Mode' : 'What-If Twin Simulator'}</span>
            </button>
            {isSimulating && (
              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Reset metrics to baseline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Simulation Controls Drawer */}
      {isSimulating && (
        <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/60 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                Interactive Twin Sandbox • Adjust Hypothetical Values
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-full">
              Live Recalculation Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Slider 1: Attendance */}
            <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Attendance</span>
                <span className="text-indigo-600 dark:text-indigo-400">{metrics.attendanceRate}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={metrics.attendanceRate}
                onChange={(e) => setMetrics({ ...metrics, attendanceRate: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Slider 2: Assessment Avg */}
            <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Assessment Avg</span>
                <span className="text-indigo-600 dark:text-indigo-400">{metrics.assessmentAvg}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={metrics.assessmentAvg}
                onChange={(e) => setMetrics({ ...metrics, assessmentAvg: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Slider 3: Submission Rate */}
            <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Submissions</span>
                <span className="text-indigo-600 dark:text-indigo-400">{metrics.submissionRate}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={metrics.submissionRate}
                onChange={(e) => setMetrics({ ...metrics, submissionRate: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Slider 4: Engagement */}
            <div className="space-y-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>LMS Engagement</span>
                <span className="text-indigo-600 dark:text-indigo-400">{metrics.engagementScore}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={metrics.engagementScore}
                onChange={(e) => setMetrics({ ...metrics, engagementScore: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Core Display Grid: Radial Health Gauge + Key Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Radial Academic Health Score Ring */}
        <div className="lg:col-span-5 unipulse-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Academic Health Score
              </h2>
            </div>
            <button
              onClick={() => setShowExplainability(!showExplainability)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showExplainability ? 'Hide Formula' : 'Why this score?'}</span>
            </button>
          </div>

          {/* SVG Radial Gauge */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="76"
                stroke="currentColor"
                strokeWidth="14"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="76"
                strokeDasharray={477.5}
                strokeDashoffset={477.5 - (477.5 * healthCalculation.totalScore) / 100}
                strokeLinecap="round"
                strokeWidth="14"
                className={`${healthCalculation.ringColor} transition-all duration-700 ease-out`}
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {healthCalculation.totalScore}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Out of 100
              </span>
            </div>
          </div>

          {/* Health Tier Badge & Trend */}
          <div className="w-full pt-2">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${healthCalculation.bgTint} ${healthCalculation.statusColor} border-current`}
              >
                {healthCalculation.statusTier} CONDITION
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                {metrics.trendSlope === 'IMPROVING' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-500 mr-1" />
                )}
                {metrics.trendSlope}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4">
              Calculated dynamically from academic performance, attendance, submission consistency, and LMS activity.
            </p>
          </div>
        </div>

        {/* Right Column (7 Cols): 5 Vector Metrics Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Metric 1: Cumulative GPA */}
          <div className="unipulse-card p-4 space-y-2 relative hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cumulative GPA
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.gpa.toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-medium">/ 4.00</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(metrics.gpa / 4.0) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {metrics.creditsCompleted} of {metrics.totalCredits} Credits Completed
            </span>
          </div>

          {/* Metric 2: Attendance Rate */}
          <div className="unipulse-card p-4 space-y-2 relative hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Attendance Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.attendanceRate}%</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {metrics.attendanceRate >= 80 ? 'Good Standing' : 'Below Threshold'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.attendanceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${metrics.attendanceRate}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Target minimum: 80.0%
            </span>
          </div>

          {/* Metric 3: Assessment Average */}
          <div className="unipulse-card p-4 space-y-2 relative hover:border-blue-300 dark:hover:border-blue-800 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assessment Average
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.assessmentAvg}%</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                Grade Eq: {metrics.assessmentAvg >= 80 ? 'A' : metrics.assessmentAvg >= 70 ? 'B' : 'C'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.assessmentAvg}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Continuous coursework score
            </span>
          </div>

          {/* Metric 4: Submission Completion */}
          <div className="unipulse-card p-4 space-y-2 relative hover:border-violet-300 dark:hover:border-violet-800 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Submission Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.submissionRate}%</span>
              <span className="text-xs text-violet-600 dark:text-violet-400 font-bold">On-Time</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.submissionRate}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Tasks & lab reports delivered
            </span>
          </div>
        </div>
      </div>

      {/* Explainable Formula Breakdown Accordion */}
      {showExplainability && (
        <div className="unipulse-card p-6 space-y-4 border-indigo-200 dark:border-indigo-900/60 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Transparent Health Score Formula Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            UniPulse computes your score using strict transparent weighting so you can pinpoint exactly what impacts your academic standing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Academic (40%)</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                +{healthCalculation.perfContrib.toFixed(1)} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">GPA & Assessment Avg</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Attendance (20%)</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                +{healthCalculation.attContrib.toFixed(1)} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{metrics.attendanceRate}% Attendance</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Submissions (15%)</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                +{healthCalculation.subContrib.toFixed(1)} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{metrics.submissionRate}% Completion</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Engagement (15%)</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                +{healthCalculation.engContrib.toFixed(1)} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">LMS Portal Activity</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Trend (10%)</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                +{healthCalculation.trendContrib.toFixed(1)} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{metrics.trendSlope} Trajectory</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations & Insights Feed */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Tailored Academic Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-1.5 transition-all ${
                rec.type === 'warning'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                  : rec.type === 'success'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs">
                {rec.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : rec.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Info className="w-4 h-4 text-indigo-600" />
                )}
                <span>{rec.title}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{rec.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
