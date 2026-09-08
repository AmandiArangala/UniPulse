'use client';

import React, { useState, useMemo } from 'react';
import { AttendanceRecordResponse, AttendanceStatus } from '@/types/student';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  User,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface AttendanceCalendarProps {
  records: AttendanceRecordResponse[];
  selectedModuleId?: string;
  className?: string;
}

export function AttendanceCalendar({
  records = [],
  selectedModuleId,
  className = '',
}: AttendanceCalendarProps) {
  // Current displayed year & month (Default to current semester date e.g. September 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(8);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayNumber(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayNumber(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 8));
    setSelectedDayNumber(8);
  };

  // Filter records matching current month, year, and optional module filter
  const monthRecords = useMemo(() => {
    return records.filter((rec) => {
      if (!rec.sessionDate) return false;
      const [rYear, rMonth] = rec.sessionDate.split('-').map(Number);
      const matchesDate = rYear === year && rMonth === month + 1;
      const matchesModule =
        !selectedModuleId ||
        selectedModuleId === 'ALL' ||
        rec.moduleCode?.toLowerCase() === selectedModuleId.toLowerCase();
      return matchesDate && matchesModule;
    });
  }, [records, year, month, selectedModuleId]);

  // Map of day number -> array of attendance records
  const recordsByDay = useMemo(() => {
    const map: Record<number, AttendanceRecordResponse[]> = {};
    monthRecords.forEach((rec) => {
      if (rec.sessionDate) {
        const day = parseInt(rec.sessionDate.split('-')[2], 10);
        if (!map[day]) map[day] = [];
        map[day].push(rec);
      }
    });
    return map;
  }, [monthRecords]);

  // Selected day's session records
  const selectedDayRecords = useMemo(() => {
    if (!selectedDayNumber) return [];
    return recordsByDay[selectedDayNumber] || [];
  }, [selectedDayNumber, recordsByDay]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-500 text-white';
      case 'LATE':
        return 'bg-amber-500 text-white';
      case 'ABSENT':
        return 'bg-rose-500 text-white';
      case 'EXCUSED':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Present
          </span>
        );
      case 'LATE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Late
          </span>
        );
      case 'ABSENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Absent
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Excused
          </span>
        );
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Calendar Matrix View (2 cols on large screen) */}
      <div className="lg:col-span-2 unipulse-card p-5 space-y-4">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h3>
              <p className="text-[11px] text-slate-400">
                {monthRecords.length} Attendance Sessions Recorded
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
            >
              Current
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* Leading empty days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 p-1 rounded-lg bg-slate-50/40 dark:bg-slate-900/30 opacity-40" />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const daySessions = recordsByDay[dayNum] || [];
            const isSelected = selectedDayNumber === dayNum;
            const hasSessions = daySessions.length > 0;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => setSelectedDayNumber(dayNum)}
                className={`h-16 p-1.5 rounded-xl text-left flex flex-col justify-between transition-all duration-150 relative group ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                    : hasSessions
                    ? 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : hasSessions
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {daySessions.length > 1 && (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                      {daySessions.length}
                    </span>
                  )}
                </div>

                {/* Session indicators */}
                <div className="flex items-center space-x-1 overflow-hidden w-full">
                  {daySessions.map((s, idx) => (
                    <span
                      key={s.id || idx}
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(s.status)}`}
                      title={`${s.moduleCode}: ${s.status}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Present</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Late</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Absent</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Excused</span>
            </span>
          </div>

          <span className="text-slate-400">Click any day to inspect sessions</span>
        </div>
      </div>

      {/* Selected Day Inspection Card (1 col on large screen) */}
      <div className="unipulse-card p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Session Inspector
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedDayNumber
                  ? `${monthNames[month]} ${selectedDayNumber}, ${year}`
                  : 'Select a Date'}
              </h4>
            </div>
            {selectedDayNumber && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {selectedDayRecords.length} {selectedDayRecords.length === 1 ? 'Session' : 'Sessions'}
              </span>
            )}
          </div>

          {selectedDayRecords.length > 0 ? (
            <div className="space-y-3">
              {selectedDayRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {rec.moduleCode}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                        {rec.moduleName || 'Academic Lecture Session'}
                      </h5>
                    </div>
                    {getStatusBadge(rec.status)}
                  </div>

                  {rec.topic && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>Topic: {rec.topic}</span>
                    </div>
                  )}

                  {rec.remarks && (
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                      Note: {rec.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                No lectures or lab sessions recorded on this day.
              </p>
              <p className="text-[10px] text-slate-400">
                Select a highlighted calendar cell to inspect session topics and attendance logs.
              </p>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-[11px] font-medium">
            Attendance records update daily upon lecturer verification.
          </span>
        </div>
      </div>
    </div>
  );
}

