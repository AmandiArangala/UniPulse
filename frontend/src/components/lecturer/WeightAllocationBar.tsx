'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sliders,
  Scale,
} from 'lucide-react';
import { AssessmentAuthoringItem } from '@/types/lecturer';

interface WeightAllocationBarProps {
  assessments: AssessmentAuthoringItem[];
  caTargetPercentage?: number;
  weTargetPercentage?: number;
}

export function WeightAllocationBar({
  assessments,
  caTargetPercentage = 40,
  weTargetPercentage = 60,
}: WeightAllocationBarProps) {
  // Compute totals
  const totalWeight = assessments.reduce((acc, a) => acc + (a.weightPercentage || 0), 0);

  const caWeight = assessments
    .filter((a) => a.type !== 'FINAL_EXAM')
    .reduce((acc, a) => acc + (a.weightPercentage || 0), 0);

  const weWeight = assessments
    .filter((a) => a.type === 'FINAL_EXAM')
    .reduce((acc, a) => acc + (a.weightPercentage || 0), 0);

  const isValid = Math.abs(totalWeight - 100) < 0.01;
  const isOver = totalWeight > 100;
  const isUnder = totalWeight < 100;

  // Colors for assessment types
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FINAL_EXAM':
        return 'bg-purple-600 text-purple-100';
      case 'MIDTERM_EXAM':
        return 'bg-indigo-600 text-indigo-100';
      case 'PROJECT':
        return 'bg-emerald-600 text-emerald-100';
      case 'ASSIGNMENT':
        return 'bg-blue-600 text-blue-100';
      case 'QUIZ':
        return 'bg-amber-500 text-amber-950';
      case 'LAB_PRACTICAL':
        return 'bg-teal-600 text-teal-100';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Title & Validation Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Dynamic Weight Allocation Monitor</span>
              <span className="text-[11px] font-semibold text-slate-400">
                (Target: 100%)
              </span>
            </h4>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>CA Total: <strong className="text-slate-800 dark:text-slate-200">{caWeight}%</strong></span>
              <span>•</span>
              <span>WE Total: <strong className="text-slate-800 dark:text-slate-200">{weWeight}%</strong></span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isValid && (
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Valid Allocation (100%)</span>
            </div>
          )}
          {isUnder && (
            <div className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Under-allocated ({totalWeight}% / 100%)</span>
            </div>
          )}
          {isOver && (
            <div className="px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Exceeds Limit ({totalWeight}% / 100%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Weight Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60 dark:border-slate-700/60">
          {assessments.map((a) => {
            if (a.weightPercentage <= 0) return null;
            return (
              <div
                key={a.id}
                title={`${a.title}: ${a.weightPercentage}%`}
                className={`h-full rounded-sm transition-all duration-300 ${getTypeColor(a.type)} relative group cursor-pointer`}
                style={{ width: `${Math.min(100, a.weightPercentage)}%` }}
              />
            );
          })}
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${getTypeColor(a.type).split(' ')[0]}`} />
              <span className="truncate max-w-[150px] font-bold">{a.title}</span>
              <span className="text-slate-400 font-mono">({a.weightPercentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
