'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Award, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1 z-30">
        <div className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
          Grade {data.grade} ({data.gradePoint.toFixed(1)} GP)
        </div>
        <div className="text-slate-300">
          Student Count: <span className="font-semibold text-white">{data.count.toLocaleString()}</span>
        </div>
        <div className="text-slate-400">
          Distribution Share: <span className="font-semibold text-white">{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export function GradeDistributionChart() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-80 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Loading Grade Analytics...</span>
      </div>
    );
  }

  const { gradeDistribution } = data;
  const totalGrades = gradeDistribution.reduce((acc, item) => acc + item.count, 0);
  const passingGrades = gradeDistribution
    .filter((item) => item.grade !== 'F' && item.grade !== 'D')
    .reduce((acc, item) => acc + item.count, 0);
  const overallPassRatePct = totalGrades > 0 ? Number(((passingGrades / totalGrades) * 100).toFixed(1)) : 88.5;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Institutional Grade Point Distribution
          </h3>
          <p className="text-[11px] text-slate-400">Frequency breakdown from A+ to F letter marks</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">Pass Rate:</span>
          <span className="font-bold text-emerald-400">{overallPassRatePct}%</span>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="grade" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {gradeDistribution.map((entry, index) => (
                <Cell key={`grade-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Normal distribution skewed towards high achievement (A-B bracket)
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Total Enrollments Analyzed: {totalGrades.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
