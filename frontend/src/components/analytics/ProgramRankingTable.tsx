'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { ProgramRankingItem } from '@/types/analytics';
import {
  Trophy,
  ExternalLink,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

type SortField = 'rank' | 'meanGpa' | 'passRatePct' | 'atRiskRatePct' | 'totalEnrolled';

export function ProgramRankingTable() {
  const { data, isLoading, setDrillThroughProgramId } = useAnalytics();
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  if (isLoading || !data) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md h-80 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-xs font-medium">Loading Program Rankings...</span>
      </div>
    );
  }

  const { programRankings } = data;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank');
    }
  };

  const sortedPrograms = [...programRankings].sort((a, b) => {
    let factor = sortAsc ? 1 : -1;
    if (sortField === 'rank') return (a.rank - b.rank) * factor;
    if (sortField === 'meanGpa') return (a.meanGpa - b.meanGpa) * factor;
    if (sortField === 'passRatePct') return (a.passRatePct - b.passRatePct) * factor;
    if (sortField === 'atRiskRatePct') return (a.atRiskRatePct - b.atRiskRatePct) * factor;
    if (sortField === 'totalEnrolled') return (a.totalEnrolled - b.totalEnrolled) * factor;
    return 0;
  });

  const getStatusBadge = (status: ProgramRankingItem['status']) => {
    switch (status) {
      case 'EXCELLENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Excellent
          </span>
        );
      case 'STABLE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Stable
          </span>
        );
      case 'NEEDS_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Needs Attention
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Academic Degree Program Rankings
          </h3>
          <p className="text-[11px] text-slate-400">
            Institutional leaderboard ordered by academic performance metrics
          </p>
        </div>

        <div className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
          {programRankings.length} Programs Analyzed
        </div>
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold bg-slate-950/40">
              <th
                onClick={() => handleSort('rank')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Program Name & Dept</th>
              <th
                onClick={() => handleSort('totalEnrolled')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Enrolled</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('meanGpa')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Mean GPA</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('passRatePct')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Pass Rate</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('atRiskRatePct')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>At-Risk %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Drill-Through</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {sortedPrograms.map((prog) => (
              <tr
                key={prog.programId}
                onClick={() => setDrillThroughProgramId(prog.programId)}
                className="hover:bg-slate-800/50 transition cursor-pointer group"
              >
                {/* Rank Badge */}
                <td className="py-3 px-3 font-bold text-slate-100">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                      prog.rank === 1
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : prog.rank === 2
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                        : prog.rank === 3
                        ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {prog.rank}
                  </span>
                </td>

                {/* Program Name */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                    {prog.programName}
                  </div>
                  <div className="text-[10px] text-slate-400">{prog.department}</div>
                </td>

                {/* Enrolled */}
                <td className="py-3 px-3 font-medium text-slate-200">{prog.totalEnrolled} students</td>

                {/* Mean GPA */}
                <td className="py-3 px-3">
                  <span className="font-extrabold text-slate-100 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {prog.meanGpa.toFixed(2)}
                  </span>
                </td>

                {/* Pass Rate % */}
                <td className="py-3 px-3">
                  <div className="space-y-1 w-24">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className="text-slate-300">{prog.passRatePct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${prog.passRatePct}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* At-Risk Rate */}
                <td className="py-3 px-3">
                  <span
                    className={`font-semibold text-xs ${
                      prog.atRiskRatePct > 10 ? 'text-rose-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {prog.atRiskRatePct}%
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3">{getStatusBadge(prog.status)}</td>

                {/* Drill-Through Action Button */}
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDrillThroughProgramId(prog.programId);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Click any row to trigger deep drill-through modal
        </span>
        <span className="text-[10px] text-slate-500">Sorted by: {sortField} ({sortAsc ? 'Asc' : 'Desc'})</span>
      </div>
    </div>
  );
}
