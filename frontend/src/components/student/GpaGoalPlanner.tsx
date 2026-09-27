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
  Calculator,
  ShieldCheck,
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

  // Core Math & Calculations
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
      remainingCredits > 0 ? requiredRemainingQualityPoints / remainingCredits : currentCgpa;

    // Max possible CGPA if straight 4.00 scored on all remaining credits
    const maxQualityPoints = currentQualityPoints + 4.0 * remainingCredits;
    const maxPossibleCgpa = totalDegreeCredits > 0 ? maxQualityPoints / totalDegreeCredits : currentCgpa;

    let feasibility: 'EASY' | 'MODERATE' | 'STRETCH' | 'UNREALISTIC' | 'IMPOSSIBLE' = 'MODERATE';

    if (remainingCredits === 0) {
      feasibility = currentCgpa >= targetCgpa ? 'EASY' : 'IMPOSSIBLE';
    } else if (requiredRemainingGpa <= 3.30) {
      feasibility = 'EASY';
    } else if (requiredRemainingGpa <= 3.70) {
      feasibility = 'MODERATE';
    } else if (requiredRemainingGpa <= 4.00) {
      feasibility = 'STRETCH';
    } else {
      feasibility = 'UNREALISTIC';
    }

    return {
      currentHonor,
      targetHonor,
      currentQualityPoints,
      targetTotalQualityPoints,
      requiredRemainingQualityPoints,
      requiredRemainingGpa,
      maxPossibleCgpa,
      feasibility,
    };
  }, [currentCgpa, earnedCredits, totalDegreeCredits, targetCgpa, remainingCredits]);

  // Recommended Grade Mix Strategies
  const recommendedStrategies = useMemo(() => {
    const { requiredRemainingGpa, maxPossibleCgpa } = gpaAnalysis;
    const reqGpa = Math.min(4.0, Math.max(0, requiredRemainingGpa));

    let mixPattern = '';
    if (reqGpa >= 3.70) {
      mixPattern = 'Target 3x Grade A (4.0) and 1x Grade A- (3.7) per semester';
    } else if (reqGpa >= 3.30) {
      mixPattern = 'Target 2x Grade A (4.0) and 2x Grade B+ (3.3) per semester';
    } else if (reqGpa >= 3.00) {
      mixPattern = 'Target 1x Grade A (4.0), 2x Grade B+ (3.3), and 1x Grade B (3.0) per semester';
    } else {
      mixPattern = 'Consistent Grade B / C+ average across remaining courses';
    }

    return [
      {
        name: 'Minimum Target Cadence',
        gpa: reqGpa.toFixed(2),
        pattern: mixPattern,
        desc: 'Baseline performance required on each remaining credit to hit target.',
        badge: requiredRemainingGpa <= 4.0 ? 'ACHIEVABLE' : 'UNREALISTIC',
        badgeColor: requiredRemainingGpa <= 4.0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
      },
      {
        name: 'Distinction Push (Straight A Cadence)',
        gpa: '4.00',
        pattern: '100% Grade A (4.0) performance across all remaining credits',
        desc: `Maximizes projected CGPA up to highest possible ${maxPossibleCgpa.toFixed(2)}.`,
        badge: maxPossibleCgpa >= targetCgpa ? 'OPTIMAL' : 'CAP REACHED',
        badgeColor: 'bg-indigo-600 text-white',
      },
      {
        name: 'Safety Buffer Target (+0.15 GPA)',
        gpa: Math.min(4.0, reqGpa + 0.15).toFixed(2),
        pattern: `Target a ${Math.min(4.0, reqGpa + 0.15).toFixed(2)} semester GPA to buffer against score drops`,
        desc: 'Provides a safety margin to guarantee target honours classification.',
        badge: Math.min(4.0, reqGpa + 0.15) <= 4.0 ? 'RECOMMENDED' : 'STRETCH',
        badgeColor: 'bg-amber-600 text-white',
      },
    ];
  }, [gpaAnalysis, targetCgpa]);

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
              <span>Academic Intelligence • Phase 5</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Target GPA Goal Planner
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Calculate exact required remaining GPA and grade combination strategies to achieve target CGPA.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 shadow-inner">
            <Award className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Standing</span>
              <span className="text-lg font-black text-white">{currentCgpa.toFixed(2)} CGPA</span>
            </div>
          </div>
        </div>
      </div>

      {/* GPA Goal Planner Math Formula Callout Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Target GPA Formula Engine</span>
            </div>
            <div className="text-sm md:text-base font-mono font-bold text-indigo-200">
              Required Remaining GPA = (Target CGPA × Total Credits - Current CGPA × Earned Credits) / Remaining Credits
            </div>
          </div>

          <div className="bg-indigo-950/80 border border-indigo-800/80 rounded-xl p-3 text-xs font-mono text-indigo-300">
            <div className="text-slate-400 text-[10px] uppercase font-sans mb-1">Live Formula Evaluator</div>
            <span>Required GPA = ({targetCgpa.toFixed(2)} × {totalDegreeCredits} - {currentCgpa.toFixed(2)} × {earnedCredits}) / {remainingCredits}</span>
            <span className="text-white font-bold block mt-0.5">
              = {gpaAnalysis.requiredRemainingGpa > 4.0 ? '>4.00 (Unachievable)' : `${Math.max(0, gpaAnalysis.requiredRemainingGpa).toFixed(2)} GPA`}
            </span>
          </div>
        </div>
      </div>

      {/* Target CGPA Slider & Feasibility Summary */}
      <div className="unipulse-card p-6 space-y-6 border-indigo-200 dark:border-indigo-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Target CGPA Goal
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Target Graduation CGPA: {targetCgpa.toFixed(2)}
            </h2>
          </div>

          {/* Feasibility Pill */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                gpaAnalysis.feasibility === 'EASY'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : gpaAnalysis.feasibility === 'MODERATE'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                  : gpaAnalysis.feasibility === 'STRETCH'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300'
              }`}
            >
              FEASIBILITY: {gpaAnalysis.feasibility}
            </span>
          </div>
        </div>

        {/* Interactive Range Input */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Pass (2.00)</span>
            <span>Current ({currentCgpa.toFixed(2)})</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Target Goal ({targetCgpa.toFixed(2)})</span>
            <span>First Class (3.70)</span>
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
              Required Remaining GPA
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
              Average needed across remaining {remainingCredits} credits.
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
              Min CGPA benchmark: {gpaAnalysis.targetHonor.minCgpa.toFixed(2)}
            </p>
          </div>

          {/* Box 3: Max Possible CGPA */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Max Possible CGPA
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {gpaAnalysis.maxPossibleCgpa.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              If 4.00 scored on all {remainingCredits} remaining credits
            </p>
          </div>

          {/* Box 4: Quality Points Deficit */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quality Points Needed
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.max(0, gpaAnalysis.requiredRemainingQualityPoints).toFixed(1)} pts
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Additional quality points required for target
            </p>
          </div>
        </div>
      </div>

      {/* Grade Combination Strategies Grid */}
      <div className="unipulse-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Recommended Grade Combination Strategies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedStrategies.map((strat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{strat.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${strat.badgeColor}`}>
                    {strat.badge}
                  </span>
                </div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {strat.gpa} <span className="text-xs text-slate-400 font-normal">GPA / sem</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  {strat.pattern}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                {strat.desc}
              </p>
            </div>
          ))}
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
              <span>Recommended Module Mix</span>
            </div>
            <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
              To hit SGPA {Math.min(4.0, Math.max(0, gpaAnalysis.requiredRemainingGpa)).toFixed(2)} next semester, aim for at least 3 Grade 'A's (4.0) and 1 Grade 'B+' (3.3) across your enrolled modules.
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
