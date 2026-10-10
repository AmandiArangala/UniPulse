'use client';

import React from 'react';
import { AnalyticsProvider, useAnalytics, AnalyticsTab } from '@/context/AnalyticsContext';
import { AnalyticsFilterBar } from '@/components/analytics/AnalyticsFilterBar';
import { DashboardOverviewView } from '@/components/analytics/DashboardOverviewView';
import { DashboardPerformanceView } from '@/components/analytics/DashboardPerformanceView';
import { DashboardEngagementView } from '@/components/analytics/DashboardEngagementView';
import {
  BarChart2,
  LayoutDashboard,
  GraduationCap,
  Activity,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

function WebAnalyticsDashboardMain() {
  const { activeTab, setActiveTab, filters } = useAnalytics();

  const handleExportCSV = () => {
    toast.success('Web Analytics Report Exported!', {
      description: 'Downloaded UniPulse_Phase6_Analytics_Export.csv containing current cross-filtered metrics.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Main Page Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                Web Analytics Dashboard
                <span className="text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  Phase 6 BI
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Institutional Executive KPIs, Academic Performance, and Predictive Engagement Correlation
              </p>
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl shadow-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Cross-Filtering Global Header Bar */}
      <AnalyticsFilterBar />

      {/* Tab Switcher Bar */}
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard 1: Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'performance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Dashboard 2: Academic Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('engagement')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'engagement'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard 3: Engagement Correlation</span>
        </button>
      </div>

      {/* Dashboard View Container */}
      <div className="pt-2">
        {activeTab === 'overview' && <DashboardOverviewView />}
        {activeTab === 'performance' && <DashboardPerformanceView />}
        {activeTab === 'engagement' && <DashboardEngagementView />}
      </div>
    </div>
  );
}

export default function WebAnalyticsDashboardPage() {
  return (
    <AnalyticsProvider>
      <WebAnalyticsDashboardMain />
    </AnalyticsProvider>
  );
}
