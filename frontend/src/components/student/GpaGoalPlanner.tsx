'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Sliders,
  GraduationCap,
  Layers,
  Zap,
  Info,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export interface DegreeClassificationThreshold {
  title: string;
  minCgpa: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const HONOURS_CLASSIFICATIONS: DegreeClassificationThreshold[] = [
  {
    title: 'First Class Honours / Distinction',
    minCgpa: 3.70,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    description: 'Requires outstanding consistent GPA performance ≥ 3.70',
  },
  {
    title: 'Second Class Upper (2:1)',
    minCgpa: 3.30,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Strong academic standing between 3.30 and 3.69',
  },
  {
    title: 'Second Class Lower (2:2)',
    minCgpa: 2.70,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Good academic standing between 2.70 and 3.29',
  },
  {
    title: 'General Pass Degree',
    minCgpa: 2.00,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800/40',
    borderColor: 'border-slate-200 dark:border-slate-800',
    description: 'Minimum graduation passing threshold ≥ 2.00',
  },
];

interface UpcomingSemesterPlan {
  semesterName: string;
  credits: number;
  plannedSgpa: number;
}

export function GpaGoalPlanner() {
  // Baseline student profile state
  const [currentCgpa, setCurrentCgpa] = useState<number>(3.24);
  const [earnedCredits, setEarnedCredits] = useState<number>(64);
  const [totalDegreeCredits, setTotalDegreeCredits] = useState<number>(120);

  // Target CGPA interactive goal
  const [targetCgpa, setTargetCgpa] = useState<number>(3.50);

  // Multi-semester trajectory state
  const remainingCredits = Math.max(0, totalDegreeCredits - earnedCredits);

  // Calculations
  const gpaAnalysis = useMemo(() => {
    const currentHonor =
      HONOURS_CLASSIFICATIONS.find((h) => currentCgpa >= h.minCgpa) ||
      HONOURS_CLASSIFICATIONS[HONOURS_CLASSIFICATIONS.length - 1];

    const targetHonor =
      HONOURS_CLASSIFICATIONS.find((h) => targetCgpa >= h.minCgpa) ||
      HONOURS_CLASSIFICATIONS[HONOURS_CLASSIFICATIONS.length - 1];

    // Formula: Required Remaining GPA = (Target CGPA * Total Credits - Current CGPA * Earned Credits) / Remaining Credits
    const currentQualityPoints = currentCgpa * earnedCredits;
    const targetTotalQualityPoints = targetCgpa * totalDegreeCredits;
    const requiredRemainingQualityPoints = targetTotalQualityPoints - currentQualityPoints;

    const requiredRemainingGpa =
      remainingCredits > 0 ? requiredRemainingQualityPoints / remainingCredits : 0;

    let feasibility: 'HIGHLY_ATTAINABLE' | 'CHALLENGING_STRETCH' | 'UNREALISTIC' =
      'HIGHLY_ATTAINABLE';

    if (requiredRemainingGpa <= 3.40) {
      feasibility = 'HIGHLY_ATTAINABLE';
    } else if (requiredRemainingGpa <= 4.00) {
      feasibility = 'CHALLENGING_STRETCH';
    } else {
      feasibility = 'UNREALISTIC';
    }

    return {
      currentHonor,
      targetHonor,
      currentQualityPoints,
      targetTotalQualityPoints,
      requiredRemainingGpa,
      feasibility,
    };
  }, [currentCgpa, earnedCredits, totalDegreeCredits, targetCgpa, remainingCredits]);

  // Projected upcoming 3 semester roadmap
  const semesterRoadmap: UpcomingSemesterPlan[] = useMemo(() => {
    const creditsPerSem = Math.round(remainingCredits / 3);
    const targetAvg = Math.min(4.0, Math.max(2.0, gpaAnalysis.requiredRemainingGpa));

    return [
      { semesterName: 'Semester 5 (Current)', credits: creditsPerSem, plannedSgpa: Math.min(4.0, targetAvg + 0.05) },
      { semesterName: 'Semester 6 (Upcoming)', credits: creditsPerSem, plannedSgpa: targetAvg },
      { semesterName: 'Semester 7 (Final Year)', credits: remainingCredits - creditsPerSem * 2, plannedSgpa: Math.max(2.0, targetAvg - 0.05) },
    ];
  }, [remainingCredits, gpaAnalysis.requiredRemainingGpa]);

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Academic Pathway & Degree Honours Optimizer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              GPA Goal Planner & Scenario Engine
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Set target CGPA benchmarks, model upcoming semester projections, and calculate exact grade pathways.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <Award className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Standing</span>
              <span className="text-lg font-black text-white">{currentCgpa.toFixed(2)} CGPA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target CGPA Slider & Feasibility Summary */}
      <div className="unipulse-card p-6 space-y-6 border-indigo-200 dark:border-indigo-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Target CGPA Goal Slider
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Select Desired Target Graduation CGPA: {targetCgpa.toFixed(2)}
            </h2>
          </div>

          {/* Feasibility Pill */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                gpaAnalysis.feasibility === 'HIGHLY_ATTAINABLE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : gpaAnalysis.feasibility === 'CHALLENGING_STRETCH'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300'
              }`}
            >
              {gpaAnalysis.feasibility.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Interactive Range Input */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Pass Threshold (2.00)</span>
            <span>Current (3.24)</span>
            <span className="text-indigo-600 dark:text-indigo-400">Target Goal ({targetCgpa.toFixed(2)})</span>
            <span>First Class Distinction (3.70)</span>
            <span>Perfect (4.00)</span>
          </div>
          <input
            type="range"
            min="2.00"
            max="4.00"
            step="0.01"
            value={targetCgpa}
            onChange={(e) => setTargetCgpa(Number(e.target.value))}
            className="w-full h-3 accent-indigo-600 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Dynamic Calculation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Box 1: Required Remaining SGPA */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-1">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              Required Remaining SGPA
            </span>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-3xl font-black ${
                  gpaAnalysis.requiredRemainingGpa > 4.0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {gpaAnalysis.requiredRemainingGpa > 4.0
                  ? '>4.00'
                  : Math.max(0, gpaAnalysis.requiredRemainingGpa).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 4.00</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Average SGPA needed across remaining {remainingCredits} credits.
            </p>
          </div>

          {/* Box 2: Target Degree Class */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Target Honours Category
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white truncate">
              {gpaAnalysis.targetHonor.title}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Benchmark min CGPA: {gpaAnalysis.targetHonor.minCgpa.toFixed(2)}
            </p>
          </div>

          {/* Box 3: Completed Credits */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Earned Degree Credits
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {earnedCredits} <span className="text-xs text-slate-400 font-normal">/ {totalDegreeCredits}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${(earnedCredits / totalDegreeCredits) * 100}%` }}
              />
            </div>
          </div>

          {/* Box 4: Quality Points Gap */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quality Points Deficit
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.max(0, gpaAnalysis.targetTotalQualityPoints - gpaAnalysis.currentQualityPoints).toFixed(1)} pts
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Total quality points needed to hit target
            </p>
          </div>
        </div>
      </div>

      {/* Main Roadmap & Honours Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Multi-Semester Roadmap */}
        <div className="lg:col-span-7 unipulse-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Upcoming Semester Pathway Roadmap
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suggested SGPA trajectory per semester to comfortably reach your {targetCgpa.toFixed(2)} CGPA target:
          </p>

          <div className="space-y-3">
            {semesterRoadmap.map((sem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {sem.semesterName}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {sem.credits} Credit Hours Coursework
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target SGPA</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {sem.plannedSgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actionable Strategy Box */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recommended Module Strategy</span>
            </div>
            <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
              To hit SGPA {gpaAnalysis.requiredRemainingGpa.toFixed(2)} next semester, target achieving at least 3 Grade 'A's (4.0) and 1 Grade 'B+' (3.3) across your enrolled modules.
            </p>
          </div>
        </div>

        {/* Right Column (5 Cols): Degree Honours Classification Matrix */}
        <div className="lg:col-span-5 unipulse-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Honours Degree Class Matrix
            </h3>
          </div>

          <div className="space-y-3">
            {HONOURS_CLASSIFICATIONS.map((cat, idx) => {
              const isCurrent = currentCgpa >= cat.minCgpa && (idx === 0 || currentCgpa < HONOURS_CLASSIFICATIONS[idx - 1].minCgpa);
              const isTarget = targetCgpa >= cat.minCgpa && (idx === 0 || targetCgpa < HONOURS_CLASSIFICATIONS[idx - 1].minCgpa);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all space-y-1 ${cat.bgColor} ${cat.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-extrabold text-xs ${cat.color}`}>
                      {cat.title}
                    </span>
                    <div className="flex items-center space-x-1">
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold">
                          CURRENT
                        </span>
                      )}
                      {isTarget && (
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
                          TARGET
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <span>Min CGPA: {cat.minCgpa.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
