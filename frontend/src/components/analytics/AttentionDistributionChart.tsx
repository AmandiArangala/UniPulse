'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { RiskStatus } from '@/types/analytics';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1 z-30">
        <div className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          {data.label}
        </div>
        <div className="text-slate-300">
          Student Count: <span className="font-semibold text-white">{data.count.toLocaleString()}</span>
        </div>
        <div className="text-slate-400">
          Share of Total: <span className="font-semibold text-white">{data.percentage}%</span>
        </div>
        <p className="text-[10px] text-indigo-400 italic pt-1 border-t border-slate-800">
          Click slice to filter dashboard view
        </p>
      </div>
    );
  }
  return null;
};

export function AttentionDistributionChart() {
  const { data, isLoading, filters, setRiskStatus } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-80 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Loading Risk Analytics...</span>
      </div>
    );
  }

  const { attentionDistribution } = data;

  const handleSliceClick = (entry: any) => {
    if (entry && entry.category) {
      if (filters.riskStatus === entry.category) {
        setRiskStatus('ALL');
      } else {
        setRiskStatus(entry.category);
      }
    }
  };

  const getIcon = (category: RiskStatus) => {
    switch (category) {
      case 'GOOD_STANDING':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'ATTENTION_NEEDED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'CRITICAL_RISK':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Risk & Attention Distribution
          </h3>
          <p className="text-[11px] text-slate-400">Tri-tier classification breakdown</p>
        </div>
        <div className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
          Interactive Donut
        </div>
      </div>

      {/* Chart & Legend Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Recharts Pie Container */}
        <div className="md:col-span-6 h-52 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attentionDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
                cursor="pointer"
                onClick={handleSliceClick}
              >
                {attentionDistribution.map((entry, index) => {
                  const isSelected = filters.riskStatus === entry.category;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isSelected ? '#FFFFFF' : '#1E293B'}
                      strokeWidth={isSelected ? 3 : 1}
                      className="transition-all duration-300 hover:opacity-90"
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-100">
              {attentionDistribution.reduce((acc, item) => acc + item.count, 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Students</span>
          </div>
        </div>

        {/* Legend / Category Breakdown */}
        <div className="md:col-span-6 space-y-2.5">
          {attentionDistribution.map((item) => {
            const isSelected = filters.riskStatus === item.category;

            return (
              <div
                key={item.category}
                onClick={() => handleSliceClick(item)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-slate-900 border border-slate-700/60">
                    {getIcon(item.category)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.percentage}% of cohort</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100">{item.count.toLocaleString()}</div>
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Click any slice to filter entire dashboard
        </span>
        {filters.riskStatus !== 'ALL' && (
          <button
            onClick={() => setRiskStatus('ALL')}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline"
          >
            Clear Risk Filter
          </button>
        )}
      </div>
    </div>
  );
}
