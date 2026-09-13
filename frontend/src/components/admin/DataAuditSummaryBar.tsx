'use client';

import React from 'react';
import { AlertTriangle, FileWarning, UserX, Database, ShieldCheck, Activity } from 'lucide-react';
import { DataAuditSummary } from '@/types/data-audit';

interface DataAuditSummaryBarProps {
  summary: DataAuditSummary | null;
  isLoading: boolean;
}

export function DataAuditSummaryBar({ summary, isLoading }: DataAuditSummaryBarProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const getIntegrityColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 75) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Integrity Gauge */}
      <div className={`p-4 rounded-2xl border ${getIntegrityColor(summary.dataIntegrityScore)} flex flex-col justify-between shadow-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">Integrity Score</span>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-black">{summary.dataIntegrityScore}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Overall Health</span>
        </div>
      </div>

      {/* Total Open Anomalies */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Open Anomalies</span>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.totalAnomalies}
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Requires Action</span>
        </div>
      </div>

      {/* Missing Marks */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Missing Marks</span>
          <FileWarning className="w-5 h-5 text-rose-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.missingMarksCount}
          </span>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Pending Approval</span>
        </div>
      </div>

      {/* Incomplete Enrollments */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Incomplete Enrollments</span>
          <UserX className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.incompleteEnrollmentsCount}
          </span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Degree Gap</span>
        </div>
      </div>

      {/* Orphaned Records */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Orphaned Records</span>
          <Database className="w-5 h-5 text-purple-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.orphanedRecordsCount}
          </span>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Clean Up Needed</span>
        </div>
      </div>
    </div>
  );
}
