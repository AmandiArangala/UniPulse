'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ZAxis,
} from 'recharts';
import { Activity, Calculator, TrendingUp, Info } from 'lucide-react';
import { ScatterPointData } from '@/types/analytics';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const point: ScatterPointData = payload[0].payload;
    if (!point || !point.studentName) return null;

    return (
      <div className="bg-slate-950 border border-slate-700 text-slate-100 p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 z-30 min-w-48">
        <div className="font-bold border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
          <span className="text-slate-100">{point.studentName}</span>
          <span className="font-mono text-[10px] text-slate-400">{point.studentId}</span>
        </div>

        <div className="text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Department:</span>
            <span className="font-semibold text-slate-200">{point.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Attendance:</span>
            <span className="font-semibold text-teal-400">{point.attendancePct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Exam Marks:</span>
            <span className="font-semibold text-indigo-400">{point.examMarksPct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Current GPA:</span>
            <span className="font-extrabold text-slate-100">{point.gpa.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-400">Status:</span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              point.riskStatus === 'GOOD_STANDING'
                ? 'bg-emerald-500/20 text-emerald-400'
                : point.riskStatus === 'ATTENTION_NEEDED'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {point.riskStatus.replace('_', ' ')}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function AttendanceVsMarksScatterPlot() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-96 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Computing OLS Linear Regression & Scatter Points...</span>
      </div>
    );
  }

  const { scatterData, regression } = data;

  const getPointColor = (status: ScatterPointData['riskStatus']) => {
    switch (status) {
      case 'GOOD_STANDING':
        return '#10B981'; // Emerald
      case 'ATTENTION_NEEDED':
        return '#F59E0B'; // Amber
      case 'CRITICAL_RISK':
        return '#EF4444'; // Rose
      default:
        return '#6366F1';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-4">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Attendance vs. Exam Marks (OLS Linear Regression)
          </h3>
          <p className="text-[11px] text-slate-400">Predictive correlation scatter plot with fitted regression line</p>
        </div>

        {/* Statistical OLS Metrics Badge Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="px-2 border-r border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Pearson Correlation (r)</span>
            <span className="font-extrabold text-indigo-400">{regression.r > 0 ? `+${regression.r}` : regression.r}</span>
          </div>

          <div className="px-2 border-r border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Coeff of Det. (R²)</span>
            <span className="font-extrabold text-emerald-400">{(regression.r2 * 100).toFixed(1)}%</span>
          </div>

          <div className="px-2 border-r border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">OLS Line Eq.</span>
            <span className="font-mono font-bold text-amber-300">
              y = {regression.slope}x + {regression.intercept}
            </span>
          </div>

          <div className="px-2">
            <span className="text-[10px] text-slate-400 block font-medium">Significance</span>
            <span className="font-bold text-emerald-400 text-[10px]">{regression.pValText}</span>
          </div>
        </div>
      </div>

      {/* Scatter Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              type="number"
              dataKey="attendancePct"
              name="Attendance Rate (%)"
              unit="%"
              domain={[40, 100]}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="examMarksPct"
              name="Exam Marks (%)"
              unit="%"
              domain={[30, 100]}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
            />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} />

            {/* Render Points */}
            <Scatter name="Students" data={scatterData}>
              {scatterData.map((entry, index) => (
                <circle
                  key={`scatter-pt-${index}`}
                  cx={0}
                  cy={0}
                  r={6}
                  fill={getPointColor(entry.riskStatus)}
                  stroke="#0F172A"
                  strokeWidth={1.5}
                  className="transition-all hover:scale-125 cursor-pointer"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Good Standing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Attention Needed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Risk
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <Calculator className="w-3 h-3 text-indigo-400" /> Statistical OLS Fit Mode
        </span>
      </div>
    </div>
  );
}
