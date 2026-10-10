'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
  Users,
  GraduationCap,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Award,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  changePct: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
  isNegativeGood?: boolean; // For metrics like At-Risk where a decrease is positive
  progressBarPct?: number;
  progressColor?: string;
}

function KPICard({
  title,
  value,
  changePct,
  changeLabel = 'vs prior term',
  icon,
  iconBg,
  iconColor,
  description,
  isNegativeGood = false,
  progressBarPct,
  progressColor = 'bg-indigo-500',
}: KPICardProps) {
  const isPositive = isNegativeGood ? changePct < 0 : changePct > 0;
  const isNeutral = changePct === 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md hover:border-indigo-500/40 transition-all duration-300 group">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-lg border ${iconBg} ${iconColor} transition-transform group-hover:scale-105`}>
            {icon}
          </div>
          <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">{title}</span>
        </div>
        <div className="relative group/tooltip">
          <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer transition" />
          <div className="absolute right-0 top-6 hidden group-hover/tooltip:block w-48 bg-slate-950 text-slate-300 text-[11px] p-2 rounded-lg border border-slate-700 shadow-xl z-20 pointer-events-none">
            {description}
          </div>
        </div>
      </div>

      {/* Main Metric Value & Trend Pill */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="text-2xl xl:text-3xl font-extrabold text-slate-100 tracking-tight">{value}</span>

        <div
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            isNeutral
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {isNeutral ? null : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{changePct > 0 ? `+${changePct}%` : `${changePct}%`}</span>
        </div>
      </div>

      {/* Bottom Subtitle / Progress Bar */}
      {progressBarPct !== undefined ? (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>Progress Index</span>
            <span className="text-slate-200">{progressBarPct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progressBarPct))}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 font-medium">{changeLabel}</p>
      )}
    </div>
  );
}

export function ExecutiveKPIGrid() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      <KPICard
        title="Total Active Students"
        value={kpis.totalStudents.toLocaleString()}
        changePct={kpis.totalStudentsChangePct}
        icon={<Users className="w-5 h-5" />}
        iconBg="bg-blue-500/10 border-blue-500/20"
        iconColor="text-blue-400"
        description="Total count of currently enrolled undergraduate and graduate students in active courses."
      />

      <KPICard
        title="Institutional Mean CGPA"
        value={kpis.averageGpa.toFixed(2)}
        changePct={kpis.averageGpaChangePct}
        icon={<GraduationCap className="w-5 h-5" />}
        iconBg="bg-indigo-500/10 border-indigo-500/20"
        iconColor="text-indigo-400"
        description="Cumulative Grade Point Average weighted across all active department programs."
        progressBarPct={Math.round((kpis.averageGpa / 4.0) * 100)}
        progressColor="bg-indigo-500"
      />

      <KPICard
        title="Average Attendance Rate"
        value={`${kpis.attendanceRatePct}%`}
        changePct={kpis.attendanceRateChangePct}
        icon={<Clock className="w-5 h-5" />}
        iconBg="bg-teal-500/10 border-teal-500/20"
        iconColor="text-teal-400"
        description="Mean lecture and lab session attendance recorded via UniPulse biometric & RFID logs."
        progressBarPct={kpis.attendanceRatePct}
        progressColor="bg-teal-500"
      />

      <KPICard
        title="Students At-Risk"
        value={kpis.atRiskCount.toLocaleString()}
        changePct={kpis.atRiskChangePct}
        isNegativeGood={true}
        icon={<ShieldAlert className="w-5 h-5" />}
        iconBg="bg-rose-500/10 border-rose-500/20"
        iconColor="text-rose-400"
        description="Count of students currently flagged in Critical Risk or Attention Needed state requiring intervention."
      />

      <KPICard
        title="Student Retention Rate"
        value={`${kpis.retentionRatePct}%`}
        changePct={kpis.retentionRateChangePct}
        icon={<CheckCircle2 className="w-5 h-5" />}
        iconBg="bg-emerald-500/10 border-emerald-500/20"
        iconColor="text-emerald-400"
        description="Percentage of enrolled students continuing from previous semester terms without academic drop-out."
        progressBarPct={kpis.retentionRatePct}
        progressColor="bg-emerald-500"
      />

      <KPICard
        title="Course Completion Rate"
        value={`${kpis.courseCompletionRatePct}%`}
        changePct={kpis.courseCompletionRateChangePct}
        icon={<Award className="w-5 h-5" />}
        iconBg="bg-amber-500/10 border-amber-500/20"
        iconColor="text-amber-400"
        description="Percentage of registered module enrollments completed with passing letter grade (≥ 50%)."
        progressBarPct={kpis.courseCompletionRatePct}
        progressColor="bg-amber-500"
      />
    </div>
  );
}
