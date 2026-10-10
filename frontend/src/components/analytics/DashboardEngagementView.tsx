'use client';

import React from 'react';
import { AttendanceVsMarksScatterPlot } from './AttendanceVsMarksScatterPlot';
import { StudentDropOffCurveChart } from './StudentDropOffCurveChart';
import { Activity } from 'lucide-react';

export function DashboardEngagementView() {
  return (
    <div className="space-y-6">
      {/* Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Dashboard 3: Engagement & Predictive Correlation
              <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Phase 6 BI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Attendance vs exam performance OLS linear regression models and student drop-off curves
            </p>
          </div>
        </div>
      </div>

      {/* Top Row: Attendance vs Marks Scatter Plot */}
      <AttendanceVsMarksScatterPlot />

      {/* Bottom Row: Student Drop-Off Funnel */}
      <StudentDropOffCurveChart />
    </div>
  );
}
