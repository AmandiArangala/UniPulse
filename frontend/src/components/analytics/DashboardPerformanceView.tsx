'use client';

import React from 'react';
import { GradeDistributionChart } from './GradeDistributionChart';
import { CohortMultiYearChart } from './CohortMultiYearChart';
import { ProgramRankingTable } from './ProgramRankingTable';
import { ProgramDrillThroughModal } from './ProgramDrillThroughModal';
import { GraduationCap } from 'lucide-react';

export function DashboardPerformanceView() {
  return (
    <div className="space-y-6">
      {/* Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Dashboard 2: Academic Performance
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Phase 6 BI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Grade distributions, program ranking leaderboards, and multi-year cohort comparisons
            </p>
          </div>
        </div>
      </div>

      {/* Top Row: Grade Distribution & Cohort Comparisons */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6">
          <GradeDistributionChart />
        </div>
        <div className="xl:col-span-6">
          <CohortMultiYearChart />
        </div>
      </div>

      {/* Bottom Row: Program Ranking Table */}
      <ProgramRankingTable />

      {/* Program Drill-Through Modal */}
      <ProgramDrillThroughModal />
    </div>
  );
}
