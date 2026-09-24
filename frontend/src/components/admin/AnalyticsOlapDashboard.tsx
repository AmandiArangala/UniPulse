'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Users,
  Award,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export interface WarehouseSummaryMetrics {
  totalFactRecords: number;
  activeStudents: number;
  activePrograms: number;
  averageCgpa: number;
  averageAttendanceRate: number;
  passRatePercentage: number;
  lastEtlSyncTimestamp: string;
  etlStatus: 'COMPLETED' | 'RUNNING' | 'STALE' | 'FAILED';
}

export interface ProgramCohortMetric {
  programCode: string;
  programName: string;
  departmentName: string;
  enrolledStudents: number;
  averageGpa: number;
  passRate: number;
  attendanceRate: number;
  riskPercentage: number;
  year2024Gpa: number;
  year2025Gpa: number;
  year2026Gpa: number;
}

export interface AtRiskStudentOlapItem {
  studentId: string;
  registrationNumber: string;
  fullName: string;
  programCode: string;
  gpa: number;
  attendanceRate: number;
  attentionScore: number; // 0-100
  riskCategory: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryRiskReason: string;
}

const MOCK_WAREHOUSE_SUMMARY: WarehouseSummaryMetrics = {
  totalFactRecords: 48520,
  activeStudents: 1420,
  activePrograms: 6,
  averageCgpa: 3.18,
  averageAttendanceRate: 81.4,
  passRatePercentage: 86.2,
  lastEtlSyncTimestamp: '2026-09-21 21:30:00 UTC',
  etlStatus: 'COMPLETED',
};

const MOCK_PROGRAM_COHORTS: ProgramCohortMetric[] = [
  {
    programCode: 'BSc-CS',
    programName: 'BSc Computer Science & Data Analytics',
    departmentName: 'Department of Computer Science',
    enrolledStudents: 420,
    averageGpa: 3.32,
    passRate: 89.5,
    attendanceRate: 84.2,
    riskPercentage: 7.2,
    year2024Gpa: 3.18,
    year2025Gpa: 3.25,
    year2026Gpa: 3.32,
  },
  {
    programCode: 'BSc-SE',
    programName: 'BSc Software Engineering',
    departmentName: 'Department of Software Engineering',
    enrolledStudents: 380,
    averageGpa: 3.24,
    passRate: 87.1,
    attendanceRate: 82.0,
    riskPercentage: 9.5,
    year2024Gpa: 3.12,
    year2025Gpa: 3.19,
    year2026Gpa: 3.24,
  },
  {
    programCode: 'BSc-IT',
    programName: 'BSc Information Technology',
    departmentName: 'Department of Information Technology',
    enrolledStudents: 350,
    averageGpa: 3.08,
    passRate: 83.4,
    attendanceRate: 79.5,
    riskPercentage: 14.1,
    year2024Gpa: 3.01,
    year2025Gpa: 3.05,
    year2026Gpa: 3.08,
  },
  {
    programCode: 'BSc-DS',
    programName: 'BSc Data Science & AI Engine',
    departmentName: 'Department of Computer Science',
    enrolledStudents: 270,
    averageGpa: 3.41,
    passRate: 92.0,
    attendanceRate: 86.8,
    riskPercentage: 4.8,
    year2024Gpa: 3.28,
    year2025Gpa: 3.35,
    year2026Gpa: 3.41,
  },
];

const MOCK_AT_RISK_STUDENTS: AtRiskStudentOlapItem[] = [
  {
    studentId: 's-101',
    registrationNumber: 'STU-2026-1092',
    fullName: 'David Miller',
    programCode: 'BSc-IT',
    gpa: 2.15,
    attendanceRate: 58.0,
    attentionScore: 82,
    riskCategory: 'HIGH',
    primaryRiskReason: 'Attendance < 60% & Two Missed Assessments',
  },
  {
    studentId: 's-102',
    registrationNumber: 'STU-2026-2144',
    fullName: 'Sophia Chen',
    programCode: 'BSc-SE',
    gpa: 2.42,
    attendanceRate: 64.5,
    attentionScore: 68,
    riskCategory: 'HIGH',
    primaryRiskReason: 'Declining Midterm Slope (-14% drop)',
  },
  {
    studentId: 's-103',
    registrationNumber: 'STU-2026-3081',
    fullName: 'Ethan Wright',
    programCode: 'BSc-CS',
    gpa: 2.68,
    attendanceRate: 71.0,
    attentionScore: 54,
    riskCategory: 'MEDIUM',
    primaryRiskReason: 'Low Assignment Submission Rate (62%)',
  },
];

export function AnalyticsOlapDashboard() {
  const [summary, setSummary] = useState<WarehouseSummaryMetrics>(MOCK_WAREHOUSE_SUMMARY);
  const [cohorts, setCohorts] = useState<ProgramCohortMetric[]>(MOCK_PROGRAM_COHORTS);
  const [atRiskList, setAtRiskList] = useState<AtRiskStudentOlapItem[]>(MOCK_AT_RISK_STUDENTS);
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter cohorts
  const filteredCohorts = cohorts.filter((c) => {
    if (selectedDepartment !== 'ALL' && c.departmentName !== selectedDepartment) return false;
    return true;
  });

  const handleRefreshEtl = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSummary((prev) => ({
        ...prev,
        lastEtlSyncTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      }));
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Institutional Star-Schema Data Warehouse • OLAP Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Institutional Cohort Analytics Portal
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Multi-dimensional analytics aggregating performance, attendance trends, and cohort comparisons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshEtl}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing DW...' : 'Run ETL Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fact Records */}
        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DW Fact Records
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.totalFactRecords.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12.4%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            Star schema `fact_performance` rows
          </span>
        </div>

        {/* Card 2: Average Institutional GPA */}
        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Institutional GPA
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.averageCgpa.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +0.07 vs 2025
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            Across {summary.activeStudents} active enrolled students
          </span>
        </div>

        {/* Card 3: Institutional Pass Rate */}
        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Module Pass Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.passRatePercentage}%
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Target ≥ 85.0%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            Aggregated across all faculties & semesters
          </span>
        </div>

        {/* Card 4: ETL Freshness & Pipeline Status */}
        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Data Warehouse Status
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Server className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {summary.etlStatus}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block truncate">
            Last ETL: {summary.lastEtlSyncTimestamp}
          </span>
        </div>
      </div>

      {/* Program Cohort Comparison Matrix */}
      <div className="unipulse-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Degree Program Performance Cohort Matrix
            </h2>
          </div>

          {/* Department Filter Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <Filter className="w-4 h-4" />
              <span>Department:</span>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Department of Computer Science">Department of Computer Science</option>
              <option value="Department of Software Engineering">Department of Software Engineering</option>
              <option value="Department of Information Technology">Department of Information Technology</option>
            </select>
          </div>
        </div>

        {/* Cohort Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Program Name</th>
                <th className="p-3">Students</th>
                <th className="p-3">Avg GPA</th>
                <th className="p-3">Pass Rate</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">GPA Trend (2024 → 2026)</th>
                <th className="p-3">Academic Risk %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCohorts.map((cohort, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{cohort.programName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{cohort.departmentName}</span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    {cohort.enrolledStudents}
                  </td>
                  <td className="p-3 font-black text-indigo-600 dark:text-indigo-400">
                    {cohort.averageGpa.toFixed(2)}
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {cohort.passRate}%
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    {cohort.attendanceRate}%
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold">
                      <span className="text-slate-400">{cohort.year2024Gpa}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-slate-400">{cohort.year2025Gpa}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">{cohort.year2026Gpa}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        cohort.riskPercentage > 10
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {cohort.riskPercentage}% Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OLAP At-Risk Attention Queue */}
      <div className="unipulse-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Star Schema High Attention Queue (`dim_student` Insights)
          </h2>
        </div>

        <div className="space-y-3">
          {atRiskList.map((st) => (
            <div
              key={st.studentId}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-amber-300 transition-colors bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  {st.attentionScore}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{st.fullName}</span>
                    <span className="text-xs text-slate-400 font-medium">({st.registrationNumber})</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {st.programCode} • Primary Flag: <span className="font-semibold text-rose-600 dark:text-rose-400">{st.primaryRiskReason}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-bold">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">GPA</span>
                  <span className="text-slate-900 dark:text-white">{st.gpa.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Attendance</span>
                  <span className="text-slate-900 dark:text-white">{st.attendanceRate}%</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] uppercase font-black">
                  {st.riskCategory} ATTENTION
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
