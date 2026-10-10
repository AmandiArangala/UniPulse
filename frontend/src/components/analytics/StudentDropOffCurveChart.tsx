'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingDown, ShieldAlert, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-30">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
            {data.retentionRatePct}% Retained
          </span>
        </div>

        <div className="text-slate-300 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Total Enrolled:</span>
            <span className="font-bold text-white">{data.enrolled.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Retained Students:</span>
            <span className="font-bold text-emerald-400">{data.retained.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Semester Drop-Off:</span>
            <span className="font-bold text-rose-400">{data.dropOutCount} ({data.dropOutRatePct}%)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function StudentDropOffCurveChart() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-72 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Loading Retention Drop-Off Curves...</span>
      </div>
    );
  }

  const { dropOffCurves } = data;
  const highestDropOffTerm = [...dropOffCurves].sort((a, b) => b.dropOutCount - a.dropOutCount)[0];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            Student Retention & Semester Drop-Off Curves
          </h3>
          <p className="text-[11px] text-slate-400">Longitudinal cohort survival analysis across academic terms</p>
        </div>

        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Peak Drop-off: {highestDropOffTerm.semester} ({highestDropOffTerm.dropOutCount} students)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dropOffCurves} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="retainedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="semester" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis domain={[1200, 1700]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="stepAfter"
              dataKey="retained"
              name="Retained Students"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#retainedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Early intervention in Sem 3 reduces cumulative drop-out rate by 40%
        </span>
        <span className="text-[10px] text-slate-500">Survival Funnel Analysis</span>
      </div>
    </div>
  );
}
