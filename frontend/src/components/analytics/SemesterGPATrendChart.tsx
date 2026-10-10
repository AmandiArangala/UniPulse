'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Filter, Sparkles } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const overallPoint = payload.find((p: any) => p.dataKey === 'overallGpa') || payload[0];
    const targetPoint = payload.find((p: any) => p.dataKey === 'targetBenchmark');

    const gpaVal = overallPoint?.value || 0;
    const targetVal = targetPoint?.value || 3.0;
    const variance = Number((gpaVal - targetVal).toFixed(2));
    const isAboveTarget = variance >= 0;

    return (
      <div className="bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-30">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label} Academic Term</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              isAboveTarget ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isAboveTarget ? `+${variance} Target Variance` : `${variance} Below Target`}
          </span>
        </div>

        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-white">{Number(item.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SemesterGPATrendChart() {
  const { data, isLoading, filters } = useAnalytics();
  const [showDepartments, setShowDepartments] = useState<boolean>(true);

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-80 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Loading GPA Trend Data...</span>
      </div>
    );
  }

  const { gpaTrends } = data;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
      {/* Header Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Semester GPA Trajectory & Benchmarks
          </h3>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>Historical institutional CGPA progression vs 3.00 Target</span>
            {filters.department !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                <Filter className="w-2.5 h-2.5" /> Filtered: {filters.department}
              </span>
            )}
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDepartments((prev) => !prev)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
              showDepartments
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Dept Lines</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={gpaTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="semester" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis domain={[2.5, 4.0]} stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />

            {/* Target 3.0 Benchmark Reference Line */}
            <ReferenceLine
              y={3.0}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              label={{
                value: 'Target Benchmark (3.00)',
                fill: '#F59E0B',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            {/* Primary Gradient Area for Overall GPA */}
            <Area
              type="monotone"
              dataKey="overallGpa"
              name="Institutional Mean GPA"
              stroke="#6366F1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gpaGradient)"
            />

            {/* Optional Department Breakdown Lines */}
            {showDepartments && filters.department === 'ALL' && (
              <>
                <Line
                  type="monotone"
                  dataKey="computerScienceGpa"
                  name="Computer Science"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="softwareEngGpa"
                  name="Software Eng"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="dataScienceGpa"
                  name="Data Science"
                  stroke="#EC4899"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cybersecurityGpa"
                  name="Cybersecurity"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  dot={false}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-500 rounded" /> Overall GPA
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 border border-dashed border-amber-500" /> Target 3.00
          </span>
          {showDepartments && filters.department === 'ALL' && (
            <>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> CS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> SE
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> DS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Cyber
              </span>
            </>
          )}
        </div>
        <span className="text-[10px] text-slate-500">Updated from analytics engine</span>
      </div>
    </div>
  );
}
