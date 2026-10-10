'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Layers, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-30">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400">Cohort Comparison</span>
        </div>
        {payload.map((item: any, idx: number) => {
          if (item.value === 0) return null;
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-bold text-white">{Number(item.value).toFixed(2)} GPA</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function CohortMultiYearChart() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-80 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Loading Cohort Analytics...</span>
      </div>
    );
  }

  const { cohortComparisons } = data;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Cohort Multi-Year Progression (2022–2025 Entry Years)
          </h3>
          <p className="text-[11px] text-slate-400">Longitudinal CGPA tracking across consecutive academic terms</p>
        </div>

        <div className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
          4 Cohorts Tracked
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cohortComparisons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="semesterLabel" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis domain={[2.5, 4.0]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />

            <Bar dataKey="cohort2022" name="2022 Cohort" fill="#6366F1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cohort2023" name="2023 Cohort" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cohort2024" name="2024 Cohort" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cohort2025" name="2025 Cohort" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Recent entry cohorts (2024/2025) demonstrate higher initial GPA trajectory
        </span>
        <span className="text-[10px] text-slate-500">Longitudinal Analysis</span>
      </div>
    </div>
  );
}
