'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { GradeDistributionData } from '@/types/lecturer';

interface GradeDistributionChartProps {
  distribution: GradeDistributionData;
}

export function GradeDistributionChart({ distribution }: GradeDistributionChartProps) {
  const maxBucketCount = Math.max(
    ...distribution.histogramBuckets.map((b) => b.studentCount),
    1
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Title & Overview Stat Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>Grade Distribution Analytics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical performance curve for {distribution.moduleCode} ({distribution.totalStudents} enrolled students)
          </p>
        </div>

        {/* Highlight Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400">Class Mean: </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {distribution.averageScore.toFixed(1)}%
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400">Median: </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {distribution.medianScore.toFixed(1)}%
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80">
            <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pass Rate: {distribution.passRatePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Histogram Bar Visualizer */}
      <div className="my-6">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Score Range Histogram
        </h4>
        <div className="grid grid-cols-7 gap-3 items-end h-44 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
          {distribution.histogramBuckets.map((bucket, index) => {
            const heightPercent = Math.max(10, Math.round((bucket.studentCount / maxBucketCount) * 100));
            const isHighest = bucket.studentCount === maxBucketCount && bucket.studentCount > 0;

            return (
              <div key={index} className="flex flex-col items-center group h-full justify-end">
                {/* Count Badge on Hover / Above Bar */}
                <span className={`text-[11px] font-bold mb-1 transition-opacity ${
                  isHighest ? 'text-indigo-600 dark:text-indigo-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:opacity-100'
                }`}>
                  {bucket.studentCount}
                </span>

                {/* Animated Vertical Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isHighest
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-200 dark:shadow-none'
                        : 'bg-gradient-to-t from-slate-400 to-indigo-300 dark:from-slate-700 dark:to-indigo-500/60 group-hover:from-indigo-500 group-hover:to-indigo-300'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Bucket Range Label */}
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate max-w-full text-center">
                  {bucket.rangeLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter Grade Count Pill Grid */}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-indigo-500" /> Letter Grade Breakdown
        </h4>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Object.entries(distribution.letterCounts).map(([letter, count]) => {
            const isTop = ['A+', 'A', 'A-'].includes(letter);
            const isFail = letter === 'F';

            return (
              <div
                key={letter}
                className={`p-2 rounded-xl text-center border transition-all ${
                  isTop
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/80'
                    : isFail
                    ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/80'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <div className={`text-xs font-bold ${
                  isTop ? 'text-emerald-700 dark:text-emerald-300' : isFail ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {letter}
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {count}
                </div>
                <div className="text-[9px] text-slate-400">
                  {distribution.totalStudents > 0 ? Math.round((count / distribution.totalStudents) * 100) : 0}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
