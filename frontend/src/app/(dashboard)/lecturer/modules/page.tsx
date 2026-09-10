'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Sliders,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AssignedModule } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { AssignedModulesGrid } from '@/components/lecturer/AssignedModulesGrid';
import { toast } from 'sonner';

export default function LecturerModulesPage() {
  const [modules, setModules] = useState<AssignedModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getAssignedModules();
      setModules(data);
    } catch (err) {
      toast.error('Failed to load assigned modules');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute overall aggregate statistics
  const totalEnrolled = modules.reduce((acc, m) => acc + m.totalEnrolledStudents, 0);
  const avgPassRate =
    modules.length > 0
      ? modules.reduce((acc, m) => acc + m.passRatePercentage, 0) / modules.length
      : 0;
  const avgScore =
    modules.length > 0
      ? modules.reduce((acc, m) => acc + m.averageGradeScore, 0) / modules.length
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Lecturer Portal • Academic Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assigned Modules Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your teaching load, monitor enrolled student rosters, and analyze grade distribution metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadModules}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Aggregate Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Modules */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Assigned Modules</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {modules.length}
          </div>
          <span className="text-[11px] text-slate-400">Year 2 Semester 1</span>
        </div>

        {/* Card 2: Total Enrolled Students */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalEnrolled}
          </div>
          <span className="text-[11px] text-slate-400">Across all assigned modules</span>
        </div>

        {/* Card 3: Class Average */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Overall Class Mean</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {avgScore.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400">Combined grade average</span>
        </div>

        {/* Card 4: Pass Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Avg Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {avgPassRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400">High academic standing</span>
        </div>
      </div>

      {/* Modules Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Active Module Roster & Analytics</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Active Semester: 2026-S1
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <AssignedModulesGrid modules={modules} />
        )}
      </div>
    </div>
  );
}
