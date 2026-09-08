'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { studentService, mockAttendanceRecords, mockAttendanceSummaries } from '@/lib/student-service';
import {
  AttendanceRecordResponse,
  AttendanceSummary,
  OverallAttendanceAnalytics,
} from '@/types/student';
import { AttendanceCalendar } from '@/components/student/AttendanceCalendar';
import { RiskBadge } from '@/components/ui/RiskBadge';
import {
  Calendar,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function StudentAttendancePage() {
  const { user } = useAuth();

  const [records, setRecords] = useState<AttendanceRecordResponse[]>(mockAttendanceRecords);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>(mockAttendanceSummaries);
  const [overallAnalytics, setOverallAnalytics] = useState<OverallAttendanceAnalytics | null>(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAttendanceData = async () => {
      setIsLoading(true);
      try {
        const studentId = user.studentId || user.id || 'ST-2024-8842';
        const [recs, analytics] = await Promise.all([
          studentService.getStudentAttendanceRecords(studentId),
          studentService.getOverallAttendanceAnalytics(studentId),
        ]);
        setRecords(recs);
        setOverallAnalytics(analytics);
        setSummaries(analytics.moduleSummaries || mockAttendanceSummaries);
      } catch {
        // Fallbacks already in studentService
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [user]);

  // Filtered log table records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.moduleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.sessionDate?.includes(searchQuery);

      const matchesModule =
        selectedModuleFilter === 'ALL' ||
        rec.moduleCode?.toLowerCase() === selectedModuleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'ALL' || rec.status === statusFilter;

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [records, searchQuery, selectedModuleFilter, statusFilter]);

  // Modules with attendance below 80%
  const flaggedModules = useMemo(() => {
    return summaries.filter((s) => s.attendancePercentage < 80.0);
  }, [summaries]);

  const overallPercentage = overallAnalytics?.overallPercentage ?? 88.6;
  const isOverallEligible = overallPercentage >= 80.0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance & Exam Eligibility Tracking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Student Attendance Portal
          </h1>
          <p className="text-xs text-slate-300">
            Enrolled Academic Year: <span className="font-bold text-indigo-300">2026/2027</span> • Minimum Institutional Threshold: <span className="font-bold text-amber-300">80.0%</span>
          </p>
        </div>

        {/* Module Filter Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-800/90 p-2 rounded-xl border border-slate-700">
          <BookOpen className="w-4 h-4 text-indigo-400 ml-1" />
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="bg-transparent font-bold text-xs text-white focus:outline-none cursor-pointer pr-2"
          >
            <option value="ALL" className="bg-slate-900 text-white">
              All Registered Modules
            </option>
            {summaries.map((s) => (
              <option key={s.moduleId || s.moduleCode} value={s.moduleCode} className="bg-slate-900 text-white">
                {s.moduleCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 80% Institutional Exam Eligibility Alert Banner */}
      {flaggedModules.length > 0 ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 via-amber-50 to-white dark:from-rose-950/40 dark:via-amber-950/20 dark:to-slate-900 border border-rose-300 dark:border-rose-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Exam Eligibility Warning: {flaggedModules.length} Course Below 80% Threshold
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                  Action Needed
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                {flaggedModules.map((m) => (
                  <span key={m.moduleCode} className="font-semibold mr-2">
                    • {m.moduleCode}: {m.attendancePercentage}% (Minimum 80% required)
                  </span>
                ))}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Students below 80% may be barred from final written examinations. Please consult your course lecturer or academic advisor.
              </p>
            </div>
          </div>

          <Link
            href="/student/modules"
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center space-x-1 flex-shrink-0 transition-colors shadow-xs"
          >
            <span>Review Course Status</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-300 dark:border-emerald-900/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Full Exam Eligibility: All Modules Meet or Exceed 80% Threshold
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are currently in good academic standing and cleared for semester examination admission tickets.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hidden sm:inline-block">
            100% Cleared
          </span>
        </div>
      )}

      {/* Top Attendance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {overallPercentage}%
            </span>
            <RiskBadge level={overallAnalytics?.riskLevel || 'LOW'} />
          </div>
          <p className="text-[11px] text-slate-400">Target: ≥ 80.0% minimum</p>
        </div>

        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Sessions Held
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {overallAnalytics?.totalSessions || 72}
          </div>
          <p className="text-[11px] text-slate-400">Across 4 Enrolled Modules</p>
        </div>

        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sessions Attended
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {overallAnalytics?.attendedSessions || 61}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              (+{overallAnalytics?.lateSessions || 5} late)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Punctuality Rate: 92.4%</p>
        </div>

        <div className="unipulse-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Unexcused Absences
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {overallAnalytics?.absentSessions || 5}
          </div>
          <p className="text-[11px] text-slate-400">
            {overallAnalytics?.excusedSessions || 0} Excused Medical Absences
          </p>
        </div>
      </div>

      {/* Module-by-Module Breakdown Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-indigo-600" /> Module Attendance & Exam Eligibility
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaries.map((mod) => {
            const isEligible = mod.attendancePercentage >= 80.0;
            return (
              <div
                key={mod.moduleId || mod.moduleCode}
                className="unipulse-card p-4 space-y-3 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {mod.moduleCode}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {mod.moduleCode === 'CS-301'
                        ? 'Database Systems'
                        : mod.moduleCode === 'CS-304'
                        ? 'Data Structures'
                        : mod.moduleCode === 'MATH-202'
                        ? 'Probability & Statistics'
                        : 'Software Architecture'}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isEligible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {isEligible ? 'Eligible' : 'At Risk'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Attendance Rate</span>
                    <span
                      className={`font-bold ${
                        isEligible ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {mod.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(mod.attendancePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] font-semibold text-slate-500">
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{mod.presentCount}</div>
                    <div>Present</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800">
                    <div className="font-bold text-amber-600">{mod.lateCount}</div>
                    <div>Late</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800">
                    <div className="font-bold text-rose-600">{mod.absentCount}</div>
                    <div>Absent</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Monthly Calendar Component */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-indigo-600" /> Interactive Monthly Attendance Calendar
        </h3>
        <AttendanceCalendar
          records={records}
          selectedModuleId={selectedModuleFilter}
        />
      </div>

      {/* Detailed Session History Log */}
      <div className="unipulse-card overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-indigo-600" /> Complete Lecture & Lab Session History
            </h3>
            <p className="text-xs text-slate-500">Audit trail of all registered learning events</p>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topic or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Session Date</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Lecture / Lab Topic</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Lecturer Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {rec.sessionDate || '2026-09-01'}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {rec.moduleCode}
                    </span>{' '}
                    <span className="text-slate-400 font-normal">({rec.moduleName})</span>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">
                    {rec.topic || 'Curriculum lecture session'}
                  </td>
                  <td className="p-3.5 text-center">
                    {rec.status === 'PRESENT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Present
                      </span>
                    )}
                    {rec.status === 'LATE' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Late
                      </span>
                    )}
                    {rec.status === 'ABSENT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Absent
                      </span>
                    )}
                    {rec.status === 'EXCUSED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Excused
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {rec.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

