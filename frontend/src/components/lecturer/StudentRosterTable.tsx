'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { EnrolledStudentRosterItem } from '@/types/lecturer';
import { RiskLevel } from '@/types/auth';

interface StudentRosterTableProps {
  roster: EnrolledStudentRosterItem[];
  moduleCode?: string;
  onFlagStudent?: (student: EnrolledStudentRosterItem) => void;
}

export function StudentRosterTable({ roster, moduleCode, onFlagStudent }: StudentRosterTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'studentNumber' | 'studentName' | 'attendancePercentage' | 'caCurrentScore'>('studentNumber');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Search Logic
  const filteredRoster = useMemo(() => {
    return roster.filter((student) => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk =
        selectedRiskFilter === 'ALL' || student.riskLevel === selectedRiskFilter;

      return matchesSearch && matchesRisk;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        const comp = (valA as string).localeCompare(valB as string);
        return sortAsc ? comp : -comp;
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [roster, searchTerm, selectedRiskFilter, sortField, sortAsc]);

  const handleSort = (field: 'studentNumber' | 'studentName' | 'attendancePercentage' | 'caCurrentScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-3 h-3 text-rose-600" /> Critical Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="w-3 h-3 text-yellow-600" /> Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Good Standing
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Enrolled Student Roster</span>
            {moduleCode && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {moduleCode}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredRoster.length} of {roster.length} registered students
          </p>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Risk Level Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Good Standing</option>
              <option value="MEDIUM">Moderate Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('studentNumber')}>
                <div className="flex items-center gap-1">
                  <span>Student ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('studentName')}>
                <div className="flex items-center gap-1">
                  <span>Student Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Program</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('attendancePercentage')}>
                <div className="flex items-center gap-1">
                  <span>Attendance %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('caCurrentScore')}>
                <div className="flex items-center gap-1">
                  <span>CA Score / 40</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Projected Grade</th>
              <th className="py-3.5 px-4">Academic Risk</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredRoster.map((student) => {
              const isAttLow = student.attendancePercentage < 80;

              return (
                <tr
                  key={student.studentId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Student ID */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {student.studentNumber}
                  </td>

                  {/* Student Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {student.studentName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {student.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Program Code */}
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-[11px]">
                      {student.programCode}
                    </span>
                  </td>

                  {/* Attendance Percentage */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isAttLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {student.attendancePercentage.toFixed(1)}%
                      </span>
                      {isAttLow && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Below 80%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* CA Score */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {student.caCurrentScore.toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-[11px]"> / {student.caMaxScore}</span>
                  </td>

                  {/* Projected Grade */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs">
                      {student.projectedGradeLetter}
                    </span>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3.5 px-4">{getRiskBadge(student.riskLevel)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onFlagStudent && onFlagStudent(student)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-semibold text-xs transition-colors"
                    >
                      Intervention
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRoster.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No students found matching your search and filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
