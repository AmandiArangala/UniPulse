'use client';

import React from 'react';
import { ExecutiveKPIGrid } from './ExecutiveKPIGrid';
import { SemesterGPATrendChart } from './SemesterGPATrendChart';
import { AttentionDistributionChart } from './AttentionDistributionChart';
import { useAnalytics } from '@/context/AnalyticsContext';
import { LayoutDashboard, Sparkles, RefreshCw } from 'lucide-react';

export function DashboardOverviewView() {
  const { refetchData, isLoading } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* View Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Dashboard 1: Executive Overview
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Phase 6 BI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Institutional performance indicators, historical GPA trends, and attention distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Engine</span>
          </button>
        </div>
      </div>

      {/* 1. Executive KPI Grid */}
      <ExecutiveKPIGrid />

      {/* 2. Charts Grid (GPA Trends + Attention Donut) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <SemesterGPATrendChart />
        </div>
        <div className="xl:col-span-5">
          <AttentionDistributionChart />
        </div>
      </div>
    </div>
  );
}
