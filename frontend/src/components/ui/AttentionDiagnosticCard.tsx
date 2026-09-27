import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  GraduationCap,
  Sparkles,
  HelpCircle,
  TrendingDown,
  Clock,
  BookOpen,
} from 'lucide-react';
import { AttentionIndicatorResult } from '@/types/attentionIndicator';
import { AttentionBadge } from './AttentionBadge';

interface AttentionDiagnosticCardProps {
  data: AttentionIndicatorResult;
  userRole?: 'STUDENT' | 'ADVISOR' | 'LECTURER' | 'ADMIN';
  compact?: boolean;
}

export function AttentionDiagnosticCard({
  data,
  userRole = 'STUDENT',
  compact = false,
}: AttentionDiagnosticCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const score = data.totalAttentionScore;
  const isHigh = score >= 60;
  const isMed = score >= 30 && score < 60;

  const meterColor = isHigh
    ? 'from-rose-500 to-red-600'
    : isMed
    ? 'from-amber-400 to-amber-500'
    : 'from-emerald-400 to-emerald-500';

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-900/5 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              Explainable Academic Attention Indicator
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Phase 5 Rule Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparent multi-factor diagnostic scoring engine (0 - 100 Scale)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AttentionBadge
            categoryTier={data.categoryTier}
            score={data.totalAttentionScore}
            badgeLabel={data.badgeLabel}
            showScore={true}
            size="md"
          />
          {compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Score Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium mb-1.5">
          <span className="text-slate-600 dark:text-slate-300">Attention Indicator Score</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{score} / 100</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${meterColor} transition-all duration-700 ease-out shadow-sm`}
            style={{ width: `${Math.min(Math.max(score, 4), 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>0 (Low / Good Standing)</span>
          <span>30 (Medium Focus)</span>
          <span>60 (High Support)</span>
          <span>100</span>
        </div>
      </div>

      {/* Expandable Diagnostic Details */}
      {expanded && (
        <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Summary Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Engine Summary Diagnostic
            </div>
            {data.summaryDiagnostic}
          </div>

          {/* Trigger Rules Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Trigger Logic Rules & Points Breakdown</span>
              <span className="text-[10px] font-normal text-slate-400">Total Possible: 100 Pts</span>
            </h4>
            <div className="space-y-2">
              {data.triggerDetails.map((trigger) => (
                <div
                  key={trigger.ruleCode}
                  className={`p-3 rounded-xl border transition-all ${
                    trigger.triggered
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-slate-800 dark:text-slate-200'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {trigger.triggered ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {trigger.ruleName}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">
                          ({trigger.thresholdDescription})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {trigger.actualValue}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                          trigger.triggered
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        +{trigger.pointsAssigned} pts
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-1.5 opacity-90 pl-6 border-l-2 border-slate-300 dark:border-slate-700 ml-2">
                    {trigger.diagnosticExplanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Advisor / Lecturer Decision Support Note */}
          {(userRole === 'ADVISOR' || userRole === 'ADMIN') && (
            <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold text-xs mb-1">
                <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Advisor Decision Support Note
              </div>
              <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                {data.advisorDiagnosticNote}
              </p>
            </div>
          )}

          {(userRole === 'LECTURER' || userRole === 'ADMIN') && (
            <div className="p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-semibold text-xs mb-1">
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Lecturer Decision Support Note
              </div>
              <p className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                {data.lecturerDiagnosticNote}
              </p>
            </div>
          )}

          {/* Actionable Recommendations */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Actionable Diagnostic Recommendations
            </h4>
            <ul className="space-y-1.5">
              {data.recommendedInterventions.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
