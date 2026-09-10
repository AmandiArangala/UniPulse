'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Award,
  Sliders,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AssignedModule } from '@/types/lecturer';

interface AssignedModulesGridProps {
  modules: AssignedModule[];
  onSelectModule?: (module: AssignedModule) => void;
}

export function AssignedModulesGrid({ modules, onSelectModule }: AssignedModulesGridProps) {
  if (!modules || modules.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Assigned Modules Found</h3>
        <p className="text-sm text-slate-500 mt-1">You are currently not assigned as primary lecturer to any active module.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => {
        const isPassHigh = module.passRatePercentage >= 90;
        const isPassOk = module.passRatePercentage >= 80 && module.passRatePercentage < 90;

        return (
          <div
            key={module.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

            <div>
              {/* Header Badge & Code */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {module.moduleCode}
                </span>
                <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>{module.semesterName}</span>
                  <span>•</span>
                  <span>{module.creditHours} Credits</span>
                </div>
              </div>

              {/* Module Title */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {module.moduleTitle}
              </h3>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 gap-3 my-5">
                {/* Enrolled Students */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Enrolled Roster</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {module.totalEnrolledStudents}
                  </div>
                  <span className="text-[10px] text-slate-400">Active Students</span>
                </div>

                {/* Average Grade */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Class Mean</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>{module.averageGradeScore.toFixed(1)}%</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      {module.averageGradeLetter}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Overall Grade</span>
                </div>
              </div>

              {/* Pass Rate Progress Bar */}
              <div className="space-y-1.5 mb-5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Pass Rate Benchmark
                  </span>
                  <span className={`font-bold ${isPassHigh ? 'text-emerald-600 dark:text-emerald-400' : isPassOk ? 'text-amber-600' : 'text-rose-600'}`}>
                    {module.passRatePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPassHigh ? 'bg-emerald-500' : isPassOk ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, module.passRatePercentage)}%` }}
                  />
                </div>
              </div>

              {/* Assessment Breakdown Status */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Assessment Allocation:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    CA {module.caWeightPercentage}% | WE {module.weWeightPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Weight Validation Status:</span>
                  {module.isWeightValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid (100%)
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Unbalanced
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2">
              <Link
                href={`/lecturer/modules/${module.id}`}
                onClick={() => onSelectModule && onSelectModule(module)}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition-colors shadow-sm"
              >
                <span>View Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/lecturer/marks?module=${module.id}`}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Marks Grid</span>
              </Link>
              <Link
                href={`/lecturer/assessments?module=${module.id}`}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                <span>Assessments</span>
              </Link>
              <Link
                href={`/lecturer/attendance?module=${module.id}`}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Attendance</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
