'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Plus,
  CheckCircle2,
  Check,
  Save,
  Filter,
} from 'lucide-react';
import { AttendanceSessionDetail, StudentAttendanceRecordItem, SessionType } from '@/types/lecturer';
import { AttendanceStatus } from '@/types/student';
import { toast } from 'sonner';

interface AttendanceSessionManagerProps {
  session: AttendanceSessionDetail;
  onSaveRecords: (sessionId: string, records: StudentAttendanceRecordItem[]) => Promise<void>;
}

export function AttendanceSessionManager({ session, onSaveRecords }: AttendanceSessionManagerProps) {
  const [records, setRecords] = useState<StudentAttendanceRecordItem[]>(session.records || []);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' as AttendanceStatus })));
    toast.success('Marked all enrolled students as PRESENT');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveRecords(session.id, records);
      toast.success('Attendance records saved successfully');
    } catch {
      toast.error('Failed to save attendance records');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRecords = records.filter((r) =>
    filterStatus === 'ALL' ? true : r.status === filterStatus
  );

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
  const attendanceRate =
    records.length > 0 ? Math.round((presentCount / records.length) * 1000) / 10 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
      {/* Session Metadata Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="px-2.5 py-0.5 rounded font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
              {session.sessionType}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {session.sessionDate}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Topic: {session.topic}
          </h3>
          <p className="text-xs text-slate-500">
            {session.moduleCode} - {session.moduleName} ({session.totalEnrolled} Enrolled Students)
          </p>
        </div>

        {/* Quick Actions & Save Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Mark All Present
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Session Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Live Session Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-slate-400 font-medium">Present</span>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {presentCount}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-slate-400 font-medium">Absent</span>
          <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            {absentCount}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-slate-400 font-medium">Late</span>
          <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
            {lateCount}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <span className="text-slate-400 font-medium">Excused</span>
          <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {excusedCount}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-center col-span-2 sm:col-span-1">
          <span className="text-slate-400 font-medium">Session Rate</span>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            {attendanceRate}%
          </div>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="p-3 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-500">Student Attendance Roster</span>
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EXCUSED">Excused</option>
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4 text-center">Status Toggle</th>
              <th className="py-3 px-4">Remarks / Excuse Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredRecords.map((r) => (
              <tr key={r.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {r.studentNumber}
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {r.studentName}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 gap-1">
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map((st) => {
                      const isActive = r.status === st;
                      let activeStyle = '';
                      if (st === 'PRESENT') activeStyle = 'bg-emerald-600 text-white shadow-sm';
                      else if (st === 'ABSENT') activeStyle = 'bg-rose-600 text-white shadow-sm';
                      else if (st === 'LATE') activeStyle = 'bg-amber-500 text-white shadow-sm';
                      else if (st === 'EXCUSED') activeStyle = 'bg-indigo-600 text-white shadow-sm';

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, st)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            isActive ? activeStyle : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {st[0]}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Add remarks..."
                    value={r.remarks || ''}
                    onChange={(e) => handleRemarksChange(r.studentId, e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
