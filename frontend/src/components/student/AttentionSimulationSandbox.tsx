'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, Sparkles, Play, ShieldAlert } from 'lucide-react';
import { AttentionSimulationRequest, AttentionIndicatorResult } from '@/types/attentionIndicator';
import { attentionIndicatorService, calculateClientAttention } from '@/lib/attention-indicator-service';
import { AttentionDiagnosticCard } from '../ui/AttentionDiagnosticCard';

interface AttentionSimulationSandboxProps {
  initialValues?: AttentionSimulationRequest;
  userRole?: 'STUDENT' | 'ADVISOR' | 'LECTURER' | 'ADMIN';
}

export function AttentionSimulationSandbox({
  initialValues,
  userRole = 'STUDENT',
}: AttentionSimulationSandboxProps) {
  const [attendanceRate, setAttendanceRate] = useState<number>(initialValues?.attendanceRate ?? 75);
  const [averageMark, setAverageMark] = useState<number>(initialValues?.averageMark ?? 65);
  const [missedTestsCount, setMissedTestsCount] = useState<number>(initialValues?.missedTestsCount ?? 1);
  const [trendSlope, setTrendSlope] = useState<'IMPROVING' | 'STABLE' | 'DECLINING'>(
    initialValues?.trendSlope ?? 'STABLE'
  );
  const [engagementScore, setEngagementScore] = useState<number>(initialValues?.engagementScore ?? 60);

  const [result, setResult] = useState<AttentionIndicatorResult>(() =>
    calculateClientAttention({
      attendanceRate,
      averageMark,
      missedTestsCount,
      trendSlope,
      engagementScore,
    })
  );

  useEffect(() => {
    const updated = calculateClientAttention({
      attendanceRate,
      averageMark,
      missedTestsCount,
      trendSlope,
      engagementScore,
    });
    setResult(updated);
  }, [attendanceRate, averageMark, missedTestsCount, trendSlope, engagementScore]);

  const handleReset = () => {
    setAttendanceRate(84);
    setAverageMark(76);
    setMissedTestsCount(0);
    setTrendSlope('IMPROVING');
    setEngagementScore(71);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Controls Panel */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                Attention Engine Simulation Sandbox
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-mono">
                  Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adjust academic risk factors to simulate rule-based diagnostic triggers in real-time
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standard Metrics
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Slider 1: Attendance Rate */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Attendance Rate</span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                  attendanceRate < 60
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {attendanceRate}% {attendanceRate < 60 ? '(+30 pts)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={attendanceRate}
              onChange={(e) => setAttendanceRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Trigger Threshold: Attendance &lt; 60%</p>
          </div>

          {/* Slider 2: Average Mark */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Assessment Average</span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                  averageMark < 50
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {averageMark}% {averageMark < 50 ? '(+30 pts)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={averageMark}
              onChange={(e) => setAverageMark(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Trigger Threshold: Average &lt; 50%</p>
          </div>

          {/* Slider 3: Missed Tests Count */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Missed Assessments</span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                  missedTestsCount >= 2
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {missedTestsCount} missed {missedTestsCount >= 2 ? '(+20 pts)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={missedTestsCount}
              onChange={(e) => setMissedTestsCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Trigger Threshold: Missed tests &gt;= 2</p>
          </div>

          {/* Selector 4: Trend Trajectory */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Grade Trend Trajectory</span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                  trendSlope === 'DECLINING'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {trendSlope} {trendSlope === 'DECLINING' ? '(+10 pts)' : ''}
              </span>
            </div>
            <select
              value={trendSlope}
              onChange={(e) =>
                setTrendSlope(e.target.value as 'IMPROVING' | 'STABLE' | 'DECLINING')
              }
              className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="IMPROVING">IMPROVING (0 pts)</option>
              <option value="STABLE">STABLE (0 pts)</option>
              <option value="DECLINING">DECLINING (+10 pts)</option>
            </select>
            <p className="text-[10px] text-slate-400">Trigger Threshold: Declining trend slope</p>
          </div>

          {/* Slider 5: Engagement Index */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 md:col-span-2 lg:col-span-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">LMS Engagement Index</span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                  engagementScore < 50
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {engagementScore}% {engagementScore < 50 ? '(+10 pts)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={engagementScore}
              onChange={(e) => setEngagementScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Trigger Threshold: Engagement score &lt; 50%</p>
          </div>
        </div>
      </div>

      {/* Real-time Result Card Output */}
      <AttentionDiagnosticCard data={result} userRole={userRole} compact={false} />
    </div>
  );
}
