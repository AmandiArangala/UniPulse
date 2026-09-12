'use client';

import React from 'react';
import {
  Users,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Calendar,
  PlusCircle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AdvisorCaseloadSummary } from '@/types/advisor';

interface AdvisorCaseloadHeaderProps {
  summary: AdvisorCaseloadSummary;
  onOpenInterventionModal: () => void;
  onFilterAtRiskClick?: () => void;
}

export function AdvisorCaseloadHeader({
  summary,
  onOpenInterventionModal,
  onFilterAtRiskClick,
}: AdvisorCaseloadHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 p-6 rounded-2xl border border-indigo-900/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Advisor Portal Workspace
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300 font-medium">{summary.departmentName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {summary.advisorName}
            <span className="text-xs font-normal px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
              Faculty Advisor
            </span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Consolidated academic caseload directory, early warning indicators, and student support case management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {onFilterAtRiskClick && (
            <button
              onClick={onFilterAtRiskClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-sm transition-all duration-200 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>At-Risk Students ({summary.atRiskCount})</span>
            </button>
          )}

          <button
            onClick={onOpenInterventionModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log New Intervention</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Assigned Students */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Caseload
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary.totalAssignedStudents}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {summary.goodStandingCount} Good Standing
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
        </div>

        {/* Card 2: Active Support Cases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Open Support Cases
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {summary.totalOpenInterventions}
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800">
                Active Cases
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {summary.probationCount} on Academic Probation
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
        </div>

        {/* Card 3: Average Caseload GPA */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Caseload Mean GPA
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
              {summary.averageCaseloadGpa.toFixed(2)}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 4.00</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Target: &ge; 3.00</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+0.12 vs Dept</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        </div>

        {/* Card 4: Average Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Attendance Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary.averageAttendanceRate.toFixed(1)}%
            </div>
            <div className="mt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, summary.averageAttendanceRate)}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Threshold 75%</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Healthy</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
        </div>
      </div>
    </div>
  );
}
