'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Award,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BookOpen,
  Clock,
  PlusCircle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Activity,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  AssignedStudent,
  Student360Detail,
  RiskLevel,
  AcademicStatus,
  InterventionStatus,
} from '@/types/advisor';
import { getStudent360Profile } from '@/lib/advisor-service';

interface Student360ProfileModalProps {
  student: AssignedStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onLogIntervention: (student: AssignedStudent) => void;
}

export function Student360ProfileModal({
  student,
  isOpen,
  onClose,
  onLogIntervention,
}: Student360ProfileModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<Student360Detail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'attendance' | 'interventions'>('overview');

  useEffect(() => {
    if (isOpen && student) {
      setLoading(true);
      getStudent360Profile(student.id)
        .then((data) => {
          setProfileData(data);
        })
        .catch((err) => {
          console.error('Failed to load student 360 profile:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const getAcademicStatusBadge = (status: AcademicStatus) => {
    switch (status) {
      case 'GOOD_STANDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Good Standing
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            At-Risk
          </span>
        );
      case 'ACADEMIC_PROBATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            Academic Probation
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/15 text-red-700 dark:text-red-400 border border-red-600/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Critical Action
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            HIGH RISK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            CRITICAL RISK
          </span>
        );
    }
  };

  const getInterventionStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            RESOLVED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            CLOSED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative border-b border-indigo-900/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/30 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md border-2 border-indigo-400/30">
                  {student.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Student 360 Diagnostic
                  </span>
                  {getRiskBadge(student.riskLevel)}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  {student.fullName}
                </h2>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  ID: {student.studentNumber} &bull; {student.programName} ({student.programCode}) &bull; Sem {student.currentSemester}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => {
                  onClose();
                  onLogIntervention(student);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Intervention</span>
              </button>
            </div>
          </div>

          {/* Quick Header Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-indigo-900/40 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-900/30">
              <span className="text-slate-400 text-[11px]">Cumulative GPA</span>
              <div className="text-lg font-black text-emerald-400 mt-0.5">{student.gpa.toFixed(2)} / 4.00</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-900/30">
              <span className="text-slate-400 text-[11px]">Overall Attendance</span>
              <div
                className={`text-lg font-black mt-0.5 ${
                  student.attendanceRate < 75 ? 'text-rose-400' : 'text-blue-400'
                }`}
              >
                {student.attendanceRate.toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-900/30">
              <span className="text-slate-400 text-[11px]">Academic Standing</span>
              <div className="mt-1">{getAcademicStatusBadge(student.academicStatus)}</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-900/30">
              <span className="text-slate-400 text-[11px]">Open Support Cases</span>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {student.openInterventionsCount} Active Case{student.openInterventionsCount === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & Risk Factors</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Academic Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('interventions')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'interventions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Intervention History</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Loading Student 360 diagnostic profile...
              </div>
            </div>
          ) : profileData ? (
            <>
              {/* TAB 1: OVERVIEW & RISKS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Risk Factors Section */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Detected Risk Indicators ({profileData.riskFactors.length})
                    </h3>

                    {profileData.riskFactors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profileData.riskFactors.map((rf) => (
                          <div
                            key={rf.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              rf.severity === 'CRITICAL'
                                ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                                : rf.severity === 'HIGH'
                                ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {rf.category}
                              </span>
                              {getRiskBadge(rf.severity)}
                            </div>

                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">
                              {rf.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {rf.description}
                            </p>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-mono">
                              Detected on {new Date(rf.detectedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          No Active Risk Factors Flagged
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Student maintains academic performance and attendance above safety threshold limits.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Advisor Confidential Notes */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      Advisor Confidential Notes
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{profileData.advisorNotes || 'No notes added for this student.'}"
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC PERFORMANCE */}
              {activeTab === 'academic' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Enrolled & Historical Module Performance
                    </h3>
                    <span className="text-xs text-slate-500">
                      Total Credits Earned: <strong className="text-slate-900 dark:text-white">{profileData.totalCreditsEarned}</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Module</th>
                          <th className="py-3 px-4 text-center">Credits</th>
                          <th className="py-3 px-4 text-center">Current Score</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                          <th className="py-3 px-4 text-center">Attendance</th>
                          <th className="py-3 px-4">Status & Diagnostic Alerts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {profileData.academicHistory.map((m) => (
                          <tr key={m.moduleId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{m.moduleCode}</div>
                              <div className="text-slate-500 text-[11px]">{m.moduleTitle}</div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold">{m.creditHours}</td>
                            <td className="py-3 px-4 text-center font-extrabold">
                              {m.currentGradeScore !== undefined ? `${m.currentGradeScore.toFixed(1)}%` : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {m.letterGrade ? (
                                <span className="px-2 py-0.5 rounded font-black text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  {m.letterGrade}
                                </span>
                              ) : (
                                '&mdash;'
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className={m.attendanceRate < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                                {m.attendanceRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {m.riskAlert ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                                  {m.riskAlert}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">{m.status}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE TRENDS */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Weekly Attendance Tracking Breakdown
                  </h3>

                  <div className="space-y-3">
                    {profileData.attendanceTrends.map((at, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-200">{at.week}</span>
                          <span className={at.attendanceRate < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                            {at.attendanceRate}% ({at.sessionsAttended} / {at.totalSessions} sessions)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              at.attendanceRate < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${at.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: INTERVENTION HISTORY */}
              {activeTab === 'interventions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Logged Academic Interventions & Support Cases
                    </h3>
                    <button
                      onClick={() => {
                        onClose();
                        onLogIntervention(student);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Log New Intervention
                    </button>
                  </div>

                  {profileData.interventions.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.interventions.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {item.interventionType.replace('_', ' ')}
                              </span>
                              {getInterventionStatusBadge(item.status)}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Logged on {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {item.reason}
                          </p>

                          {item.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 italic">
                              "{item.notes}"
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            <span>
                              Initiated by: <strong>{item.initiatorName}</strong> ({item.initiatorRole})
                            </span>
                            {item.followUpDate && (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                Follow-up Date: {item.followUpDate}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        No Interventions Logged
                      </div>
                      <p className="text-xs text-slate-500">
                        No support case interventions have been recorded for this student yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              Failed to load profile details.
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          >
            Close Profile
          </button>

          <button
            onClick={() => {
              onClose();
              onLogIntervention(student);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Academic Support Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
