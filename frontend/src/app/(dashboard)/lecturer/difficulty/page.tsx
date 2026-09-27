'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Award,
  AlertTriangle,
  ShieldAlert,
  Percent,
  Layers,
  ArrowUpRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { AssignedModule } from '@/types/lecturer';
import { ModuleDifficultyIndexItem, TopicMasteryGapItem, AssessmentDifficultyItem } from '@/types/difficulty';
import { lecturerService } from '@/lib/lecturer-service';
import { moduleDifficultyService } from '@/lib/module-difficulty-service';
import { toast } from 'sonner';

export default function LecturerDifficultyPage() {
  const [modules, setModules] = useState<AssignedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [mdiData, setMdiData] = useState<ModuleDifficultyIndexItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTopicFilter, setActiveTopicFilter] = useState<'ALL' | 'CRITICAL_GAP' | 'CHALLENGING' | 'WELL_MASTERED'>('ALL');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getAssignedModules();
      setModules(data);
      if (data.length > 0) {
        setSelectedModuleId(data[0].id);
      }
    } catch {
      toast.error('Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModuleId) {
      loadModuleDifficulty(selectedModuleId);
    }
  }, [selectedModuleId]);

  const loadModuleDifficulty = async (modId: string) => {
    setIsLoading(true);
    try {
      const data = await moduleDifficultyService.getModuleDifficultyIndex(modId);
      setMdiData(data);
    } catch {
      toast.error('Failed to load module difficulty intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModule = useMemo(() => {
    return modules.find((m) => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const filteredTopics = useMemo(() => {
    if (!mdiData || !mdiData.topicDiagnostics) return [];
    if (activeTopicFilter === 'ALL') return mdiData.topicDiagnostics;
    return mdiData.topicDiagnostics.filter((t) => t.difficultyRating === activeTopicFilter);
  }, [mdiData, activeTopicFilter]);

  const getDifficultyBandBadge = (band: string) => {
    switch (band) {
      case 'CRITICAL_DIFFICULTY':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            Critical Difficulty
          </span>
        );
      case 'HIGH':
      case 'HARD':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            High Difficulty
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            Moderate Difficulty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Low Difficulty (Stable)
          </span>
        );
    }
  };

  const getTopicRatingBadge = (rating: string) => {
    switch (rating) {
      case 'CRITICAL_GAP':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Critical Learning Gap
          </span>
        );
      case 'CHALLENGING':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Challenging Topic
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Moderate
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Well Mastered
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Module Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Academic Intelligence & Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Module Difficulty Index & Topic Diagnostics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Composite evaluation of Failure Rates, Mean Marks, Repeat & Withdrawal Rates to detect curriculum bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => selectedModuleId && loadModuleDifficulty(selectedModuleId)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="py-2.5 px-3.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.moduleCode} - {m.moduleTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Calculating Module Difficulty Index and analyzing topic mastery gaps...
          </div>
        </div>
      ) : mdiData ? (
        <>
          {/* Main Hero Card: Module Difficulty Index Overview */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {mdiData.moduleCode} &bull; {mdiData.moduleTitle}
                  </span>
                  {getDifficultyBandBadge(mdiData.difficultyBand)}
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Module Difficulty Index (MDI): <span className="text-indigo-400">{mdiData.difficultyIndexScore.toFixed(1)}</span> / 100
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{mdiData.summaryInsight}"
                </p>

                <div className="text-xs text-slate-400 flex items-center gap-3 pt-2">
                  <span>Enrolled Cohort: <strong className="text-white">{mdiData.totalEnrolled} Students</strong></span>
                  <span>&bull;</span>
                  <span>Evaluated Assessments: <strong className="text-white">{mdiData.assessments?.length || 0} Components</strong></span>
                </div>
              </div>

              {/* Index Score Gauge Visual */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-indigo-800/40 min-w-[200px]">
                <div className="relative flex items-center justify-center w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        mdiData.difficultyIndexScore >= 70
                          ? 'text-rose-500'
                          : mdiData.difficultyIndexScore >= 50
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }
                      strokeDasharray={`${mdiData.difficultyIndexScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-white">{mdiData.difficultyIndexScore.toFixed(0)}</span>
                    <span className="text-[10px] block text-slate-400 uppercase font-mono">MDI Index</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Contributing MDI Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Module Failure Rate</span>
                <span className="text-indigo-500 font-mono">35% Weight</span>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {mdiData.failureRate.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Students scoring below 40% passing threshold or assigned grade F.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Mean Final Mark</span>
                <span className="text-indigo-500 font-mono">25% Weight</span>
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {mdiData.meanFinalMark.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Average student grade mark across all module components.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Repeat Rate</span>
                <span className="text-indigo-500 font-mono">20% Weight</span>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {mdiData.repeatRate.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Percentage of students repeating this module from prior terms.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Withdrawal Rate</span>
                <span className="text-indigo-500 font-mono">20% Weight</span>
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {mdiData.withdrawalRate.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Percentage of registered students who dropped or withdrew.
              </p>
            </div>
          </div>

          {/* Assessment Components Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <span>Assessment Level Difficulty Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analyzing statistical dispersion, failure rate, and difficulty band for each assessment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mdiData.assessments && mdiData.assessments.length > 0 ? (
                mdiData.assessments.map((ass) => (
                  <div
                    key={ass.assessmentId}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        Weight: {ass.weightage}%
                      </span>
                      {getDifficultyBandBadge(ass.difficultyBand)}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {ass.assessmentName}
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Evaluated Students: <strong>{ass.totalStudentsEvaluated}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-center text-xs">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Avg Score</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{ass.averageScore.toFixed(1)}%</span>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Pass Rate</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{ass.passRate.toFixed(1)}%</span>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Std Dev</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">&plusmn;{ass.standardDeviation.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-6 text-center text-slate-400 text-xs">
                  No individual assessment difficulty analytics available for this module.
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Topic Mastery Diagnostics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span>Topic Mastery & Learning Gap Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pinpointing curriculum topics with severe student mastery deficits
                </p>
              </div>

              {/* Topic Rating Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveTopicFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTopicFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All Topics ({mdiData.topicDiagnostics?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTopicFilter('CRITICAL_GAP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTopicFilter === 'CRITICAL_GAP'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Critical Gaps
                </button>

                <button
                  onClick={() => setActiveTopicFilter('CHALLENGING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTopicFilter === 'CHALLENGING'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Challenging
                </button>

                <button
                  onClick={() => setActiveTopicFilter('WELL_MASTERED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTopicFilter === 'WELL_MASTERED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Well Mastered
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4">Curriculum Topic Name</th>
                    <th className="py-3.5 px-4 text-center">Avg Score %</th>
                    <th className="py-3.5 px-4 text-center">Pass Rate %</th>
                    <th className="py-3.5 px-4 text-center">Mastery Gap</th>
                    <th className="py-3.5 px-4">Difficulty Rating</th>
                    <th className="py-3.5 px-4">Actionable Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTopics.map((topic) => (
                    <tr key={topic.topicId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {topic.topicName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-indigo-600 dark:text-indigo-400">
                        {topic.averageScorePercentage.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        {topic.studentPassPercentage.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-rose-600 dark:text-rose-400">
                        {topic.masteryGapPercentage.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4">
                        {getTopicRatingBadge(topic.difficultyRating)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 italic text-[11px]">
                        "{topic.recommendation}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTopics.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No topic diagnostic data matching selected filter.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-slate-500">
          Failed to load difficulty index details.
        </div>
      )}
    </div>
  );
}
