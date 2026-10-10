'use client';

import React from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Filter, RotateCcw, Search, X, SlidersHorizontal } from 'lucide-react';

const DEPARTMENTS = [
  { value: 'ALL', label: 'All Departments' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Information Systems', label: 'Information Systems' },
];

const SEMESTERS = [
  { value: 'ALL', label: 'All Semesters' },
  { value: 'Semester 1', label: 'Semester 1' },
  { value: 'Semester 2', label: 'Semester 2' },
  { value: 'Semester 3', label: 'Semester 3' },
  { value: 'Semester 4', label: 'Semester 4' },
  { value: 'Semester 5', label: 'Semester 5' },
  { value: 'Semester 6', label: 'Semester 6' },
];

const ACADEMIC_YEARS = [
  { value: 'ALL', label: 'All Academic Years' },
  { value: '2022/2023', label: '2022 / 2023' },
  { value: '2023/2024', label: '2023 / 2024' },
  { value: '2024/2025', label: '2024 / 2025' },
  { value: '2025/2026', label: '2025 / 2026' },
];

const RISK_LEVELS = [
  { value: 'ALL', label: 'All Risk Levels' },
  { value: 'GOOD_STANDING', label: 'Good Standing' },
  { value: 'ATTENTION_NEEDED', label: 'Attention Needed' },
  { value: 'CRITICAL_RISK', label: 'Critical Risk' },
];

export function AnalyticsFilterBar() {
  const {
    filters,
    setDepartment,
    setSemester,
    setAcademicYear,
    setRiskStatus,
    setSearchTerm,
    resetFilters,
  } = useAnalytics();

  const hasActiveFilters =
    filters.department !== 'ALL' ||
    filters.semester !== 'ALL' ||
    filters.academicYear !== 'ALL' ||
    filters.riskStatus !== 'ALL' ||
    filters.searchTerm.trim() !== '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md mb-6 space-y-3">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Title / Icon Indicator */}
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm shrink-0">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span>Cross-Filtering Controls</span>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 flex-1 max-w-4xl">
          {/* Department Select */}
          <select
            value={filters.department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value} className="bg-slate-900 text-slate-200">
                {dept.label}
              </option>
            ))}
          </select>

          {/* Semester Select */}
          <select
            value={filters.semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {SEMESTERS.map((sem) => (
              <option key={sem.value} value={sem.value} className="bg-slate-900 text-slate-200">
                {sem.label}
              </option>
            ))}
          </select>

          {/* Academic Year Select */}
          <select
            value={filters.academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr.value} value={yr.value} className="bg-slate-900 text-slate-200">
                {yr.label}
              </option>
            ))}
          </select>

          {/* Risk Level Select */}
          <select
            value={filters.riskStatus}
            onChange={(e) => setRiskStatus(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {RISK_LEVELS.map((risk) => (
              <option key={risk.value} value={risk.value} className="bg-slate-900 text-slate-200">
                {risk.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input & Reset Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={filters.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-44 bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 text-xs font-medium rounded-lg pl-8 pr-3 py-2 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {filters.searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition ${
              hasActiveFilters
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Active Slices:
          </span>

          {filters.department !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
              Dept: {filters.department}
              <button onClick={() => setDepartment('ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.semester !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
              {filters.semester}
              <button onClick={() => setSemester('ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.academicYear !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
              Year: {filters.academicYear}
              <button onClick={() => setAcademicYear('ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.riskStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
              Risk: {filters.riskStatus.replace('_', ' ')}
              <button onClick={() => setRiskStatus('ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2.5 py-0.5 rounded-full font-medium">
              Query: &quot;{filters.searchTerm}&quot;
              <button onClick={() => setSearchTerm('')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
