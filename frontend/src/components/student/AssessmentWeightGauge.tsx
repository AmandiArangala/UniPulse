'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, Scale, Award, Info } from 'lucide-react';

interface AssessmentWeightGaugeProps {
  caWeight: number; // e.g. 40 (%)
  weWeight: number; // e.g. 60 (%)
  caScoreObtained?: number; // e.g. 31.4 pts
  weScoreObtained?: number; // e.g. 41.0 pts
  finalGrade?: number; // e.g. 72.4 (%)
  letterGrade?: string; // e.g. "B+"
  meetsComponentThreshold?: boolean;
  minComponentThresholdPercent?: number; // e.g. 40% minimum required in each component
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

export function AssessmentWeightGauge({
  caWeight = 40,
  weWeight = 60,
  caScoreObtained,
  weScoreObtained,
  finalGrade,
  letterGrade,
  meetsComponentThreshold = true,
  minComponentThresholdPercent = 40,
  compact = false,
  showLabels = true,
  className = '',
}: AssessmentWeightGaugeProps) {
  // Normalize weights if total != 100
  const totalWeight = caWeight + weWeight || 100;
  const caNormalized = (caWeight / totalWeight) * 100;
  const weNormalized = (weWeight / totalWeight) * 100;

  // Percentage obtained within each component (e.g. 31.4 out of 40 = 78.5%)
  const caPercentage =
    caScoreObtained !== undefined && caWeight > 0
      ? Math.round((caScoreObtained / caWeight) * 1000) / 10
      : null;
  const wePercentage =
    weScoreObtained !== undefined && weWeight > 0
      ? Math.round((weScoreObtained / weWeight) * 1000) / 10
      : null;

  const isCaPassing = caPercentage === null || caPercentage >= minComponentThresholdPercent;
  const isWePassing = wePercentage === null || wePercentage >= minComponentThresholdPercent;
  const isPassingBoth = isCaPassing && isWePassing && meetsComponentThreshold;

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {/* Split progress bar */}
        <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
          <div
            className="bg-indigo-600 h-full transition-all duration-500 relative"
            style={{ width: `${caNormalized}%` }}
            title={`Continuous Assessment (CA): ${caWeight}%`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500 relative"
            style={{ width: `${weNormalized}%` }}
            title={`Written Examination (WE): ${weWeight}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span>CA {caWeight}%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>WE {weWeight}%</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3 ${className}`}
    >
      {/* Header with Title and Weight Ratio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assessment Weight Distribution
            </h4>
            <p className="text-[10px] text-slate-400">
              CA ({caWeight}%) • Written Exam ({weWeight}%)
            </p>
          </div>
        </div>

        {letterGrade && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black text-slate-900 dark:text-white">{letterGrade}</span>
            {finalGrade !== undefined && (
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                ({finalGrade}%)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Segmented Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex p-0.5 space-x-0.5">
          <div
            className="bg-indigo-600 h-full rounded-l-full transition-all duration-500 relative"
            style={{ width: `${caNormalized}%` }}
          />
          <div
            className="bg-amber-500 h-full rounded-r-full transition-all duration-500 relative"
            style={{ width: `${weNormalized}%` }}
          />
        </div>

        {/* Labels below the bar */}
        {showLabels && (
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            {/* Continuous Assessment (CA) Box */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block mr-1.5" />
                  Continuous (CA)
                </span>
                <span className="text-[11px] font-bold text-slate-500">{caWeight}% Wgt</span>
              </div>
              {caScoreObtained !== undefined ? (
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {caScoreObtained.toFixed(1)}
                    <span className="text-[10px] text-slate-400 font-normal"> / {caWeight} pts</span>
                  </span>
                  {caPercentage !== null && (
                    <span
                      className={`text-[10px] font-bold ${
                        caPercentage >= minComponentThresholdPercent ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {caPercentage}% score
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400">In Progress</span>
              )}
            </div>

            {/* Written Examination (WE) Box */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5" />
                  Written Exam (WE)
                </span>
                <span className="text-[11px] font-bold text-slate-500">{weWeight}% Wgt</span>
              </div>
              {weScoreObtained !== undefined ? (
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {weScoreObtained.toFixed(1)}
                    <span className="text-[10px] text-slate-400 font-normal"> / {weWeight} pts</span>
                  </span>
                  {wePercentage !== null && (
                    <span
                      className={`text-[10px] font-bold ${
                        wePercentage >= minComponentThresholdPercent ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {wePercentage}% score
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400">Scheduled</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Component Threshold Compliance Indicator */}
      <div
        className={`p-2.5 rounded-lg flex items-center justify-between text-xs font-medium border ${
          isPassingBoth
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isPassingBoth ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          )}
          <span>
            {isPassingBoth
              ? `Component Threshold Passed (Min. ${minComponentThresholdPercent}% in CA & WE)`
              : `Component Threshold Warning (Minimum ${minComponentThresholdPercent}% required in each component to pass)`}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {isPassingBoth ? 'Compliant' : 'Action Required'}
        </span>
      </div>
    </div>
  );
}

