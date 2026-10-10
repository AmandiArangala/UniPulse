'use client';

import React, { useEffect, useState } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { ProgramDetailDrillThrough } from '@/types/analytics';
import { analyticsService } from '@/lib/analytics-service';
import {
  X,
  GraduationCap,
  Users,
  Award,
  ShieldAlert,
  BookOpen,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export function ProgramDrillThroughModal() {
  const { drillThroughProgramId, setDrillThroughProgramId } = useAnalytics();
  const [detail, setDetail] = useState<ProgramDetailDrillThrough | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (drillThroughProgramId) {
      setLoading(true);
      analyticsService
        .getProgramDrillThrough(drillThroughProgramId)
        .then((data) => setDetail(data))
        .catch(() => setDetail(null))
        .finally(() => setLoading(false));
    }
  }, [drillThroughProgramId]);

  if (!drillThroughProgramId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-100">
                  {loading ? 'Loading Program Details...' : detail?.program.programName}
                </h2>
                {detail?.program.status === 'EXCELLENT' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Rank #{detail.program.rank} • Excellent
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{detail?.program.department} • Granular Drill-Through Analytics</p>
            </div>
          </div>

          <button
            onClick={() => setDrillThroughProgramId(null)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        {loading || !detail ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Fetching program level records & student rosters...
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Top Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">Total Enrolled</span>
                <div className="text-xl font-bold text-slate-100 mt-1 flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  {detail.program.totalEnrolled}
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">Mean CGPA</span>
                <div className="text-xl font-bold text-slate-100 mt-1 flex items-center justify-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  {detail.program.meanGpa.toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">Pass Rate</span>
                <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4" />
                  {detail.program.passRatePct}%
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">At-Risk Rate</span>
                <div className="text-xl font-bold text-rose-400 mt-1 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {detail.program.atRiskRatePct}%
                </div>
              </div>
            </div>

            {/* Split Section: Modules & At-Risk Roster */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Modules */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Key Course Modules Performance
                </h3>

                <div className="space-y-2">
                  {detail.topModules.map((mod) => (
                    <div
                      key={mod.code}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            {mod.code}
                          </span>
                          <span>{mod.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Pass Rate: {mod.passRatePct}%</div>
                      </div>
                      <div className="font-extrabold text-slate-100 bg-slate-800 px-2 py-1 rounded">
                        {mod.avgScore}% Avg
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* At-Risk Student Roster */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Flagged At-Risk Students
                </h3>

                <div className="space-y-2">
                  {detail.atRiskStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{st.name}</div>
                        <div className="text-[10px] text-slate-400">Attendance: {st.attendancePct}%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-rose-400">{st.gpa.toFixed(2)} GPA</div>
                        <span className="text-[9px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                          {st.riskLevel.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={() => setDrillThroughProgramId(null)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition"
          >
            Close Drill-Through
          </button>
        </div>
      </div>
    </div>
  );
}
