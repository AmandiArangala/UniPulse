'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RiskBadge } from '@/components/ui/RiskBadge';
import {
  TrendingUp,
  Award,
  Calendar,
  AlertTriangle,
  Sliders,
  Sparkles,
  Users,
  CheckCircle2,
  BarChart2,
  Database,
  ArrowUpRight,
  UserCheck,
  PlusCircle,
  Clock,
  Layers,
  Activity,
  FileCheck,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

export default function DashboardOverviewPage() {
  const { role, user, setRole } = useAuth();

  // What-If Simulator state
  const [finalMark, setFinalMark] = useState<number>(75);

  // Intervention Modal state
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionCreated, setInterventionCreated] = useState(false);

  // Simulated grade calculation for What-If simulator
  // Assignment: 72 * 0.20 = 14.4
  // Midterm: 61 * 0.30 = 18.3
  // Final: finalMark * 0.50
  const currentContribution = 14.4 + 18.3;
  const projectedOverall = (currentContribution + finalMark * 0.5).toFixed(1);
  const getLetterGrade = (score: number) => {
    if (score >= 85) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 75) return 'A-';
    if (score >= 70) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 60) return 'B-';
    if (score >= 55) return 'C+';
    if (score >= 50) return 'C';
    return 'F';
  };

  // Sample data for charts
  const assessmentDifficultyData = [
    { name: 'Quiz 1', score: 78 },
    { name: 'Assign 1', score: 73 },
    { name: 'Quiz 2', score: 69 },
    { name: 'Midterm', score: 48 }, // Difficult assessment
    { name: 'Assign 2', score: 75 },
  ];

  const topicDifficultyData = [
    { topic: 'SQL Basics', score: 81 },
    { topic: 'Joins', score: 67 },
    { topic: 'Indexing', score: 52 },
    { topic: 'Transactions', score: 57 },
    { topic: 'Normalization', score: 43 },
  ];

  const interventionOutcomeData = [
    { type: 'Peer Tutoring', improvement: 78 },
    { type: 'Extra Tutorial', improvement: 72 },
    { type: 'Consultation', improvement: 67 },
    { type: 'Revision Session', improvement: 61 },
  ];

  const cohortComparisonData = [
    { year: '2022', gpa: 3.01, passRate: 82, attendance: 76 },
    { year: '2023', gpa: 3.12, passRate: 85, attendance: 79 },
    { year: '2024', gpa: 3.19, passRate: 87, attendance: 81 },
  ];

  const handleCreateInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInterventionCreated(true);
    setShowInterventionModal(false);
    toast.success('Intervention Created Successfully', {
      description: 'Logged academic consultation for Marcus Vance in Database Systems',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UniPulse Phase 1 • Architecture & Setup</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs text-slate-300">
            Active View: <span className="font-bold text-indigo-300">{role} PERSPECTIVE</span> • {user.department}
          </p>
        </div>

        {/* View Switcher Bar */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase">
            Demo View:
          </span>
          {(['STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                role === r
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT DASHBOARD SCREEN ("Academic Pulse & Digital Twin") */}
      {/* ========================================================================= */}
      {role === 'STUDENT' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="unipulse-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current GPA
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  3.24
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +0.12
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Target: 3.50 (Semester projected)</p>
            </div>

            <div className="unipulse-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overall Attendance
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  82%
                </span>
                <RiskBadge level="LOW" />
              </div>
              <p className="text-[11px] text-slate-400">Above required 80% threshold</p>
            </div>

            <div className="unipulse-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Credits Completed
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  64 / 120
                </span>
                <span className="text-xs font-bold text-slate-500">53%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full w-[53%]" />
              </div>
            </div>

            <div className="unipulse-card p-5 space-y-2 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                  Academic Health Score
                </span>
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    78
                  </span>
                  <span className="text-slate-400 font-medium text-sm"> / 100</span>
                </div>
                <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Good Condition
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Weighted: Performance (40%), Attendance (20%), Submissions (15%), Engagement (15%), Trend (10%)
              </p>
            </div>
          </div>

          {/* Enrolled Modules Grid & What-If Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Modules Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-indigo-600" /> Enrolled Modules (Fall 2026)
                </h3>
                <span className="text-xs text-slate-500">3 Active Courses</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="unipulse-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        CS-301
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        Database Systems
                      </h4>
                    </div>
                    <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200">
                      B+
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Grade Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">72.4%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full w-[72.4%]" />
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attendance:</span>
                    <span className="font-bold text-rose-600">68%</span>
                  </div>
                  <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                    ⚠️ Attendance dropped to 68%
                  </div>
                </div>

                <div className="unipulse-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        CS-304
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        Data Structures
                      </h4>
                    </div>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
                      A
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Grade Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">84.0%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full w-[84%]" />
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attendance:</span>
                    <span className="font-bold text-emerald-600">92%</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ Strong Performance
                  </div>
                </div>

                <div className="unipulse-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        MATH-202
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        Statistics & Data
                      </h4>
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200">
                      B
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Grade Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">69.5%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full w-[69.5%]" />
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attendance:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">86%</span>
                  </div>
                  <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    Midterm Exam ahead
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive What-If Grade Simulator Widget */}
            <div className="unipulse-card p-5 space-y-4 border-indigo-200 dark:border-indigo-900">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                  <Sliders className="w-4 h-4 mr-2 text-indigo-600" /> What-If Grade Simulator
                </h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Interactive
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assignments (20%):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">72% (Contrib: 14.4)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Midterm Exam (30%):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">61% (Contrib: 18.3)</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1 flex justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Current Base:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">32.7 pts</span>
                </div>
              </div>

              {/* Slider for remaining Final Examination (50% weight) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Projected Final Exam Mark (50% weight):
                  </label>
                  <span className="font-black text-indigo-600 text-sm">{finalMark}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={finalMark}
                  onChange={(e) => setFinalMark(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Projected Result Box */}
              <div className="p-4 rounded-xl bg-indigo-600 text-white flex items-center justify-between shadow-lg shadow-indigo-200 dark:shadow-none">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-200">
                    Projected Final Mark
                  </div>
                  <div className="text-2xl font-black">{projectedOverall}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-indigo-200">
                    Projected Grade
                  </div>
                  <div className="text-2xl font-black text-amber-300">
                    {getLetterGrade(Number(projectedOverall))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LECTURER DASHBOARD SCREEN ("Module Intelligence & Attention Radar") */}
      {/* ========================================================================= */}
      {role === 'LECTURER' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Module Control Bar */}
          <div className="unipulse-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                CS
              </div>
              <div>
                <select className="font-bold text-base bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer">
                  <option value="CS301">CS-301: Database Systems (Fall 2026)</option>
                  <option value="CS304">CS-304: Data Structures</option>
                </select>
                <p className="text-xs text-slate-500">Lecture Section A • 142 Enrolled Students</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-xs">
              <div className="text-center">
                <div className="text-slate-400 font-medium">Class Average</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">71.4%</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 font-medium">Attendance Health</div>
                <div className="text-lg font-black text-emerald-600">84.2%</div>
              </div>
              <button
                onClick={() => setShowInterventionModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create Intervention</span>
              </button>
            </div>
          </div>

          {/* Academic Attention Queue Data Table */}
          <div className="unipulse-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" /> Academic Attention Queue
                </h3>
                <p className="text-xs text-slate-500">Students flagged for academic support intervention</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                4 Students Flagged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Student ID & Name</th>
                    <th className="p-3.5">Current Avg</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5">Missed Assessments</th>
                    <th className="p-3.5">Risk Tag</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      Marcus Vance <span className="text-slate-400 font-mono text-[11px] font-normal">(ST-8841)</span>
                    </td>
                    <td className="p-3.5 font-bold text-rose-600">48.2%</td>
                    <td className="p-3.5 font-bold text-amber-600">62%</td>
                    <td className="p-3.5">2 Missed</td>
                    <td className="p-3.5"><RiskBadge level="HIGH" score={72} showScore /></td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setShowInterventionModal(true)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold rounded hover:bg-indigo-100"
                      >
                        + Intervention
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      Elena Torres <span className="text-slate-400 font-mono text-[11px] font-normal">(ST-8902)</span>
                    </td>
                    <td className="p-3.5 font-bold text-amber-600">54.0%</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">78%</td>
                    <td className="p-3.5">1 Missed</td>
                    <td className="p-3.5"><RiskBadge level="MEDIUM" score={45} showScore /></td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setShowInterventionModal(true)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold rounded hover:bg-indigo-100"
                      >
                        + Intervention
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Assessment & Topic Difficulty Analyzer Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="unipulse-card p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-indigo-600" /> Assessment Difficulty Analyzer
              </h3>
              <p className="text-xs text-slate-500">Highlighting difficult assessment components (Midterm Exam: 48%)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assessmentDifficultyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {assessmentDifficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score < 50 ? '#EF4444' : '#4F46E5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="unipulse-card p-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                <Layers className="w-4 h-4 mr-2 text-indigo-600" /> Topic-Level Difficulty Drilldown
              </h3>
              <p className="text-xs text-slate-500">Student score averages by module topic (Normalization: 43%)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicDifficultyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                    <YAxis type="category" dataKey="topic" stroke="#94A3B8" fontSize={11} width={90} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {topicDifficultyData.map((entry, index) => (
                        <Cell key={`cell-topic-${index}`} fill={entry.score < 50 ? '#F59E0B' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACADEMIC ADVISOR HUB SCREEN ("Student 360 & Intervention Manager") */}
      {/* ========================================================================= */}
      {role === 'ADVISOR' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Caseload Matrix */}
            <div className="lg:col-span-2 unipulse-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" /> Student Caseload Matrix
                </h3>
                <span className="text-xs text-slate-500">28 Assigned Advisees</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Marcus Vance</span>
                      <RiskBadge level="HIGH" score={76} showScore />
                    </div>
                    <p className="text-xs text-slate-500">BSc IT • Year 2 • GPA: 2.14 • Attendance: 62%</p>
                  </div>
                  <button
                    onClick={() => setShowInterventionModal(true)}
                    className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700 transition-colors"
                  >
                    Log Intervention
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Sophia Chen</span>
                      <RiskBadge level="MEDIUM" score={42} showScore />
                    </div>
                    <p className="text-xs text-slate-500">BSc SE • Year 3 • GPA: 2.85 • Attendance: 76%</p>
                  </div>
                  <button
                    onClick={() => setShowInterventionModal(true)}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 transition-colors"
                  >
                    Log Intervention
                  </button>
                </div>
              </div>
            </div>

            {/* Intervention Outcome Analytics */}
            <div className="unipulse-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" /> Intervention Outcome Analytics
              </h3>
              <p className="text-xs text-slate-500">% Students showing grade improvement post-intervention</p>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interventionOutcomeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="type" stroke="#94A3B8" fontSize={9} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="improvement" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN DASHBOARD SCREEN ("Institutional Analytics") */}
      {/* ========================================================================= */}
      {role === 'ADMIN' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cohort Comparison Grid */}
            <div className="lg:col-span-2 unipulse-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-indigo-600" /> Cohort Performance Comparison (BSc IT)
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cohortComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={3} name="Avg GPA" />
                    <Line type="monotone" dataKey="passRate" stroke="#10B981" strokeWidth={2} name="Pass Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ETL & Data Quality Card */}
            <div className="unipulse-card p-5 space-y-4 border-indigo-200 dark:border-indigo-900">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                  <Database className="w-4 h-4 mr-2 text-indigo-600" /> Data Quality & ETL Health
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  HEALTHY
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="text-slate-500">PostgreSQL Extraction:</span>
                  <span className="font-bold text-emerald-600">✓ 450,000 Records</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="text-slate-500">Pandas Data Quality Pipeline:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">0 Missing Flags</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="text-slate-500">Duplicate Check:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Passed (0 Dups)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERVENTION WORKFLOW MODAL (Per Figma Prompt Specification) */}
      {/* ========================================================================= */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-indigo-600" /> Create Academic Support Intervention
              </h3>
              <button
                onClick={() => setShowInterventionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInterventionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Student
                </label>
                <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <option>Marcus Vance (ST-8841) • High Risk</option>
                  <option>Elena Torres (ST-8902) • Medium Risk</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Intervention Type
                </label>
                <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <option>Lecturer Academic Consultation</option>
                  <option>Peer Tutoring Session</option>
                  <option>Additional Tutorial</option>
                  <option>Study Planning Assistance</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Intervention
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain academic triggers (e.g. attendance dropped to 62%, failed midterm exam)..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  defaultValue="Declining assessment performance on Database Systems Midterm Exam."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-none"
                >
                  Save & Log Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
