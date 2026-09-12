'use client';

import React from 'react';
import {
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
  ExternalLink,
  PlusCircle,
  X,
  FileSpreadsheet,
  BarChart2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AssignedStudent, AcademicStatus, RiskLevel } from '@/types/advisor';

interface AdvisorStudentCaseloadTableProps {
  students: AssignedStudent[];
  onSelectStudent: (student: AssignedStudent) => void;
  onLogIntervention: (student: AssignedStudent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: AcademicStatus | 'ALL';
  onStatusFilterChange: (status: AcademicStatus | 'ALL') => void;
  riskFilter: RiskLevel | 'ALL';
  onRiskFilterChange: (risk: RiskLevel | 'ALL') => void;
}

export function AdvisorStudentCaseloadTable({
  students,
  onSelectStudent,
  onLogIntervention,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  riskFilter,
  onRiskFilterChange,
}: AdvisorStudentCaseloadTableProps) {
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || riskFilter !== 'ALL';

  const resetFilters = () => {
    onSearchChange('');
    onStatusFilterChange('ALL');
    onRiskFilterChange('ALL');
  };

  const getAcademicStatusBadge = (status: AcademicStatus) => {
    switch (status) {
      case 'GOOD_STANDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            Good Standing
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            At-Risk
          </span>
        );
      case 'ACADEMIC_PROBATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            Probation
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-700 dark:text-red-400 border border-red-600/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Critical Action
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Withdrawn
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskLevelBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            LOW
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            MEDIUM
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            HIGH
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            CRITICAL
          </span>
        );
    }
  };

  const getGpaPill = (gpa: number) => {
    let colorClasses = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (gpa < 2.5) {
      colorClasses = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    } else if (gpa < 3.0) {
      colorClasses = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    } else if (gpa < 3.5) {
      colorClasses = 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    }

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colorClasses}`}>
        {gpa.toFixed(2)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
      {/* Top Filter & Search Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student name, ID (e.g. SE/2024/001), or program..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Academic Status Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as AcademicStatus | 'ALL')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Academic Statuses</option>
              <option value="GOOD_STANDING">Good Standing</option>
              <option value="AT_RISK">At Risk</option>
              <option value="ACADEMIC_PROBATION">Academic Probation</option>
              <option value="CRITICAL">Critical Action</option>
            </select>
          </div>

          {/* Risk Level Select */}
          <select
            value={riskFilter}
            onChange={(e) => onRiskFilterChange(e.target.value as RiskLevel | 'ALL')}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Caseload Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/80 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Student Profile</th>
              <th className="py-3.5 px-4">Program & Sem</th>
              <th className="py-3.5 px-4 text-center">GPA</th>
              <th className="py-3.5 px-4">Academic Status</th>
              <th className="py-3.5 px-4 text-center">Risk Level</th>
              <th className="py-3.5 px-4 text-center">Attendance</th>
              <th className="py-3.5 px-4 text-center">Open Cases</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {students.length > 0 ? (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Student Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm border border-indigo-200 dark:border-indigo-800">
                          {student.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                        >
                          {student.fullName}
                        </button>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {student.studentNumber}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Program & Semester */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {student.programCode}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Sem {student.currentSemester} &bull; {student.departmentName}
                    </div>
                  </td>

                  {/* GPA */}
                  <td className="py-3.5 px-4 text-center">{getGpaPill(student.gpa)}</td>

                  {/* Academic Status */}
                  <td className="py-3.5 px-4">{getAcademicStatusBadge(student.academicStatus)}</td>

                  {/* Risk Level */}
                  <td className="py-3.5 px-4 text-center">{getRiskLevelBadge(student.riskLevel)}</td>

                  {/* Attendance Rate */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`font-extrabold text-xs ${
                          student.attendanceRate < 75
                            ? 'text-rose-600 dark:text-rose-400'
                            : student.attendanceRate < 85
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {student.attendanceRate.toFixed(1)}%
                      </span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            student.attendanceRate < 75
                              ? 'bg-rose-500'
                              : student.attendanceRate < 85
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Open Interventions Count */}
                  <td className="py-3.5 px-4 text-center">
                    {student.openInterventionsCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-300 dark:border-amber-800 shadow-sm">
                        {student.openInterventionsCount}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">&mdash;</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1"
                        title="Open Student 360 Profile"
                      >
                        <span>Student 360</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onLogIntervention(student)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors"
                        title="Log Support Intervention Case"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      No matching students found
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                      We couldn't find any assigned student in your caseload matching your search query or selected status filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-2">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{students.length}</span> assigned student{students.length === 1 ? '' : 's'}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Good Standing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            At-Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Probation
          </span>
        </div>
      </div>
    </div>
  );
}
