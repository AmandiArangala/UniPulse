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
} from 'lucide-react';
import { AssignedModule, TopicDiagnosticItem } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { toast } from 'sonner';

export default function LecturerDifficultyPage() {
  const [modules, setModules] = useState<AssignedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<TopicDiagnosticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      loadDiagnostics(selectedModuleId);
    }
  }, [selectedModuleId]);

  const loadDiagnostics = async (modId: string) => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getTopicDiagnostics(modId);
      setDiagnostics(data);
    } catch {
      toast.error('Failed to load topic diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModule = useMemo(() => {
    return modules.find((m) => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const getDifficultyBadge = (rating: string) => {
    switch (rating) {
      case 'CRITICAL_GAP':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Critical Learning Gap
          </span>
        );
      case 'CHALLENGING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Challenging Topic
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Moderate Difficulty
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Well Mastered
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Lecturer Portal • Curriculum Diagnostics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Module Difficulty & Topic Analyzer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze student mastery per curriculum topic to identify learning bottlenecks and assessment difficulty levels.
          </p>
        </div>

        {/* Module Selector */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
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

      {/* Diagnostics Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Topic Mastery Breakdown ({selectedModule?.moduleCode})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assessing student performance across diagnostic topic tags
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Curriculum Topic Name</th>
                <th className="py-3.5 px-4">Assessments Tagged</th>
                <th className="py-3.5 px-4">Average Score %</th>
                <th className="py-3.5 px-4">Pass Rate %</th>
                <th className="py-3.5 px-4">Difficulty Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {diagnostics.map((topic) => (
                <tr key={topic.topicId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {topic.topicName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {topic.assessmentCount} Assessments
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {topic.averageScorePercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      {topic.studentPassPercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getDifficultyBadge(topic.difficultyRating)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {diagnostics.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No topic diagnostic data available for this module.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
