'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  BarChart2,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

export interface AssessmentItem {
  id: string;
  title: string;
  type: 'QUIZ' | 'ASSIGNMENT' | 'MIDTERM' | 'FINAL_EXAM' | 'PROJECT';
  weight: number; // e.g. 10 for 10%
  score: number; // 0-100
  isCompleted: boolean;
}

export interface ModuleSimulatorData {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  creditHours: number;
  assessments: AssessmentItem[];
}

const GRADE_THRESHOLDS = [
  { letter: 'A', minScore: 80, gpa: 4.0 },
  { letter: 'A-', minScore: 75, gpa: 3.7 },
  { letter: 'B+', minScore: 70, gpa: 3.3 },
  { letter: 'B', minScore: 65, gpa: 3.0 },
  { letter: 'B-', minScore: 60, gpa: 2.7 },
  { letter: 'C+', minScore: 55, gpa: 2.3 },
  { letter: 'C', minScore: 50, gpa: 2.0 },
  { letter: 'F', minScore: 0, gpa: 0.0 },
];

const MOCK_MODULES: ModuleSimulatorData[] = [
  {
    moduleId: 'mod-1',
    moduleCode: 'CS301',
    moduleTitle: 'Database Systems & SQL Warehousing',
    creditHours: 4,
    assessments: [
      { id: 'a1', title: 'Quiz 1: ER Modeling', type: 'QUIZ', weight: 10, score: 85, isCompleted: true },
      { id: 'a2', title: 'Assignment 1: SQL Queries', type: 'ASSIGNMENT', weight: 15, score: 72, isCompleted: true },
      { id: 'a3', title: 'Midterm Examination', type: 'MIDTERM', weight: 25, score: 64, isCompleted: true },
      { id: 'a4', title: 'Lab Project: Data Pipeline', type: 'PROJECT', weight: 15, score: 78, isCompleted: false },
      { id: 'a5', title: 'Final Examination', type: 'FINAL_EXAM', weight: 35, score: 70, isCompleted: false },
    ],
  },
  {
    moduleId: 'mod-2',
    moduleCode: 'CS302',
    moduleTitle: 'Full-Stack Web Architecture',
    creditHours: 3,
    assessments: [
      { id: 'b1', title: 'Quiz 1: HTTP & REST API', type: 'QUIZ', weight: 15, score: 90, isCompleted: true },
      { id: 'b2', title: 'Assignment 1: React Dashboard', type: 'ASSIGNMENT', weight: 20, score: 88, isCompleted: true },
      { id: 'b3', title: 'Midterm Evaluation', type: 'MIDTERM', weight: 25, score: 82, isCompleted: true },
      { id: 'b4', title: 'Final Comprehensive Exam', type: 'FINAL_EXAM', weight: 40, score: 75, isCompleted: false },
    ],
  },
];

export function WhatIfGradeSimulator() {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(MOCK_MODULES[0].moduleId);
  const [targetGradeLetter, setTargetGradeLetter] = useState<string>('B+');

  // Active module state
  const activeModule = useMemo(() => {
    return MOCK_MODULES.find((m) => m.moduleId === selectedModuleId) || MOCK_MODULES[0];
  }, [selectedModuleId]);

  // Assessment scores state
  const [assessmentsState, setAssessmentsState] = useState<Record<string, AssessmentItem[]>>({
    'mod-1': MOCK_MODULES[0].assessments,
    'mod-2': MOCK_MODULES[1].assessments,
  });

  const currentAssessments = assessmentsState[selectedModuleId] || activeModule.assessments;

  const handleScoreChange = (id: string, newScore: number) => {
    setAssessmentsState((prev) => ({
      ...prev,
      [selectedModuleId]: (prev[selectedModuleId] || activeModule.assessments).map((item) =>
        item.id === id ? { ...item, score: newScore } : item
      ),
    }));
  };

  // Calculations
  const simulationResults = useMemo(() => {
    const targetThreshold = GRADE_THRESHOLDS.find((g) => g.letter === targetGradeLetter)?.minScore || 70;

    let completedWeightPoints = 0;
    let completedWeight = 0;

    let remainingWeight = 0;

    currentAssessments.forEach((item) => {
      if (item.isCompleted) {
        completedWeightPoints += (item.score * item.weight) / 100;
        completedWeight += item.weight;
      } else {
        remainingWeight += item.weight;
      }
    });

    // Weighted average of all assessments using current sliders
    const totalWeightedScore = currentAssessments.reduce((sum, item) => {
      return sum + (item.score * item.weight) / 100;
    }, 0);

    // Minimum score needed across remaining uncompleted assessments to hit targetThreshold
    const requiredPointsFromRemaining = targetThreshold - completedWeightPoints;
    const requiredAverageOnRemaining =
      remainingWeight > 0 ? (requiredPointsFromRemaining / remainingWeight) * 100 : 0;

    // Feasibility calculation
    let feasibility: 'LOCKED' | 'ACHIEVABLE' | 'UNATTAINABLE' = 'ACHIEVABLE';
    if (completedWeightPoints >= targetThreshold) {
      feasibility = 'LOCKED';
    } else if (requiredAverageOnRemaining > 100) {
      feasibility = 'UNATTAINABLE';
    } else {
      feasibility = 'ACHIEVABLE';
    }

    // Projected Letter Grade based on current totalWeightedScore
    const currentLetter =
      GRADE_THRESHOLDS.find((g) => totalWeightedScore >= g.minScore)?.letter || 'F';

    return {
      targetThreshold,
      completedWeightPoints,
      completedWeight,
      remainingWeight,
      totalWeightedScore,
      requiredAverageOnRemaining,
      feasibility,
      currentLetter,
    };
  }, [currentAssessments, targetGradeLetter]);

  // Sensitivity scenarios table for final exam
  const sensitivityScenarios = useMemo(() => {
    const finalExamItem = currentAssessments.find((a) => a.type === 'FINAL_EXAM' || !a.isCompleted);
    if (!finalExamItem) return [];

    const otherItemsWeightedScore = currentAssessments
      .filter((a) => a.id !== finalExamItem.id)
      .reduce((sum, item) => sum + (item.score * item.weight) / 100, 0);

    const testScores = [50, 60, 70, 75, 80, 85, 90, 100];

    return testScores.map((examScore) => {
      const overallScore = otherItemsWeightedScore + (examScore * finalExamItem.weight) / 100;
      const letter = GRADE_THRESHOLDS.find((g) => overallScore >= g.minScore)?.letter || 'F';
      return {
        examScore,
        overallScore: Math.round(overallScore * 10) / 10,
        letter,
      };
    });
  }, [currentAssessments]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Interactive What-If Grade Simulator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Coursework & Examination Goal Engine
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Simulate target grades and determine exact exam marks required for academic success.
            </p>
          </div>

          {/* Module Selector & Target Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                {MOCK_MODULES.map((mod) => (
                  <option key={mod.moduleId} value={mod.moduleId} className="bg-slate-900 text-white">
                    {mod.moduleCode}: {mod.moduleTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-indigo-600 rounded-xl p-2 flex items-center space-x-2">
              <Target className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">Target:</span>
              <select
                value={targetGradeLetter}
                onChange={(e) => setTargetGradeLetter(e.target.value)}
                className="bg-indigo-800 text-white text-xs font-bold rounded px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                {GRADE_THRESHOLDS.filter((g) => g.letter !== 'F').map((g) => (
                  <option key={g.letter} value={g.letter}>
                    Grade {g.letter} ({g.minScore}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Target Feasibility Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          simulationResults.feasibility === 'LOCKED'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            : simulationResults.feasibility === 'UNATTAINABLE'
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
            : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              simulationResults.feasibility === 'LOCKED'
                ? 'bg-emerald-600'
                : simulationResults.feasibility === 'UNATTAINABLE'
                ? 'bg-rose-600'
                : 'bg-indigo-600'
            }`}
          >
            {simulationResults.feasibility === 'LOCKED' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : simulationResults.feasibility === 'UNATTAINABLE' ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <Target className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base">
                Target Grade {targetGradeLetter} ({simulationResults.targetThreshold}%) Status
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-current">
                {simulationResults.feasibility}
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90 font-medium">
              {simulationResults.feasibility === 'LOCKED'
                ? `Congratulations! You have already earned ${simulationResults.completedWeightPoints.toFixed(
                    1
                  )} weight points, locking in Grade ${targetGradeLetter}.`
                : simulationResults.feasibility === 'UNATTAINABLE'
                ? `Reaching Grade ${targetGradeLetter} requires an average of ${simulationResults.requiredAverageOnRemaining.toFixed(
                    1
                  )}% on remaining assessments (>100% threshold). Consider aiming for Grade B.`
                : `You need an average score of ${Math.max(
                    0,
                    simulationResults.requiredAverageOnRemaining
                  ).toFixed(1)}% on remaining assessments (${simulationResults.remainingWeight}% weight) to secure Grade ${targetGradeLetter}.`}
            </p>
          </div>
        </div>

        {/* Quick Calculation Summary Badges */}
        <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-current/20 pt-3 md:pt-0 md:pl-6">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Current Overall
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {simulationResults.totalWeightedScore.toFixed(1)}%
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
              (Grade {simulationResults.currentLetter})
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Required Exam
            </span>
            <span
              className={`text-2xl font-black ${
                simulationResults.requiredAverageOnRemaining > 85
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {simulationResults.remainingWeight > 0
                ? `${Math.max(0, simulationResults.requiredAverageOnRemaining).toFixed(1)}%`
                : 'N/A'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block">
              On {simulationResults.remainingWeight}% Weight
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Assessment Sliders + Sensitivity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Assessment Slider Controls */}
        <div className="lg:col-span-7 unipulse-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Coursework & Exam Breakdown ({activeModule.moduleCode})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              100% Total Course Weight
            </span>
          </div>

          <div className="space-y-4">
            {currentAssessments.map((item) => {
              const contribution = (item.score * item.weight) / 100;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 ${
                    item.isCompleted
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          item.isCompleted
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-bold">
                      <span className="text-slate-400">{item.weight}% Weight</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        +{contribution.toFixed(1)} pts
                      </span>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>{item.isCompleted ? 'Actual Score Obtained' : 'Hypothetical Simulator Score'}</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400">{item.score}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.score}
                      onChange={(e) => handleScoreChange(item.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 Cols): Final Exam Sensitivity Matrix */}
        <div className="lg:col-span-5 unipulse-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Final Exam Outcome Curve
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Projected overall module score and letter grade depending on your performance in the remaining examination:
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Exam Mark</th>
                  <th className="p-2.5">Overall %</th>
                  <th className="p-2.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sensitivityScenarios.map((row, idx) => {
                  const isTargetMatch = row.letter === targetGradeLetter;
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isTargetMatch
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="p-2.5 flex items-center space-x-1">
                        <span>{row.examScore}%</span>
                        {isTargetMatch && <Sparkles className="w-3 h-3 text-indigo-500" />}
                      </td>
                      <td className="p-2.5">{row.overallScore}%</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            row.letter.startsWith('A')
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : row.letter.startsWith('B')
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {row.letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
