'use client';

import React from 'react';
import {
  Award,
  UserCheck,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskLevel } from '@/types/auth';

interface AcademicKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  riskLevel?: RiskLevel;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'indigo';
  };
  className?: string;
}

export function AcademicKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-indigo-50 dark:bg-indigo-950/50',
  iconColor = 'text-indigo-600 dark:text-indigo-400',
  trend,
  progress,
  riskLevel,
  badge,
  className = '',
}: AcademicKpiCardProps) {
  const getBadgeClasses = (variant: 'success' | 'warning' | 'danger' | 'info' | 'indigo') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'indigo':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
    }
  };

  return (
    <div className={`unipulse-card p-5 space-y-2.5 relative transition-all duration-200 hover:shadow-md ${className}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shadow-xs`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Main Value & Badges / Trends */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-bold flex items-center ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
              )}
              {trend.isPositive ? `+${trend.value}` : `${trend.value}`}
            </span>
          )}
        </div>

        {riskLevel && <RiskBadge level={riskLevel} />}

        {badge && (
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${getBadgeClasses(badge.variant)}`}>
            {badge.text}
          </span>
        )}
      </div>

      {/* Progress Bar (Optional) */}
      {progress && (
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(progress.percentage, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtitle / Context Note */}
      {subtitle && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Specialized Presets for Academic Portal
// ============================================================================

export function CgpaKpiCard({
  cgpa = 3.24,
  trend = 0.12,
  target = '3.50 Target (First Class Honours)',
}: {
  cgpa?: number;
  trend?: number;
  target?: string;
}) {
  return (
    <AcademicKpiCard
      title="Cumulative CGPA"
      value={cgpa.toFixed(2)}
      icon={Award}
      iconBgColor="bg-indigo-50 dark:bg-indigo-950/60"
      iconColor="text-indigo-600 dark:text-indigo-400"
      trend={{
        value: Math.abs(trend).toFixed(2),
        isPositive: trend >= 0,
        label: 'vs Last Term',
      }}
      subtitle={target}
    />
  );
}

export function AttendanceKpiCard({
  attendancePercentage = 82,
  threshold = 80,
}: {
  attendancePercentage?: number;
  threshold?: number;
}) {
  const isEligible = attendancePercentage >= threshold;
  const riskLevel: RiskLevel = attendancePercentage < 75 ? 'HIGH' : attendancePercentage < 80 ? 'MEDIUM' : 'LOW';

  return (
    <AcademicKpiCard
      title="Overall Attendance"
      value={`${attendancePercentage}%`}
      icon={UserCheck}
      iconBgColor={isEligible ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-rose-50 dark:bg-rose-950/60'}
      iconColor={isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
      riskLevel={riskLevel}
      subtitle={
        isEligible
          ? `✓ Above required ${threshold}% threshold for exam eligibility`
          : `⚠️ Below ${threshold}% threshold — Exam eligibility at risk`
      }
    />
  );
}

export function CreditsKpiCard({
  earnedCredits = 64,
  totalCredits = 120,
}: {
  earnedCredits?: number;
  totalCredits?: number;
}) {
  const percentage = Math.round((earnedCredits / totalCredits) * 100);

  return (
    <AcademicKpiCard
      title="Credits Completed"
      value={`${earnedCredits} / ${totalCredits}`}
      icon={CheckCircle2}
      iconBgColor="bg-blue-50 dark:bg-blue-950/60"
      iconColor="text-blue-600 dark:text-blue-400"
      progress={{
        current: earnedCredits,
        total: totalCredits,
        percentage,
      }}
      subtitle={`${totalCredits - earnedCredits} credits remaining for graduation`}
    />
  );
}

export function AcademicHealthCard({
  healthScore = 78,
  status = 'Good Condition',
}: {
  healthScore?: number;
  status?: string;
}) {
  return (
    <div className="unipulse-card p-5 space-y-2.5 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-800/50 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
          Academic Health Score
        </span>
        <div className="w-9 h-9 rounded-xl bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {healthScore}
          </span>
          <span className="text-slate-400 font-medium text-xs">/ 100</span>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
          {status}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(Math.max(healthScore, 0), 100)}%` }}
        />
      </div>

      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
        Weighted: Performance (40%), Attendance (20%), Submissions (15%), Engagement (15%), Trend (10%)
      </p>
    </div>
  );
}

