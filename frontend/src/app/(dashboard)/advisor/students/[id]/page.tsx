'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
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
  Mail,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  Student360Detail,
  AcademicStatus,
  RiskLevel,
  InterventionStatus,
  AcademicInterventionItem,
} from '@/types/advisor';
import { getStudent360Profile } from '@/lib/advisor-service';
import { AcademicInterventionModal } from '@/components/advisor/AcademicInterventionModal';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function Student360DetailPage({ params }: PageProps) {
  const [studentId, setStudentId] = useState<string>('');
  const [profile, setProfile] = useState<Student360Detail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setStudentId(p.id);
    });
  }, [params]);

  const loadProfile = async (id: string) => {
    setLoading(true);
    try {
      const data = await getStudent360Profile(id);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load student 360 profile:', err);
      toast.error('Failed to load student diagnostic profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadProfile(studentId);
    }
  }, [studentId]);

  const getAcademicStatusBadge = (status: AcademicStatus) => {
    switch (status) {
      case 'GOOD_STANDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Good Standing
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            At-Risk
          </span>
        );
      case 'ACADEMIC_PROBATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            Academic Probation
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/15 text-red-700 dark:text-red-400 border border-red-600/30">
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
          <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            HIGH RISK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
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

  const handleInterventionCreated = (newIntervention: AcademicInterventionItem) => {
    toast.success(`Academic support case logged for ${newIntervention.studentName}!`);
    if (studentId) {
      loadProfile(studentId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading Student 360 Diagnostic Profile...
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-8 space-y-6">
        <Link
          href="/advisor/caseload"
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Caseload Matrix
        </Link>
        <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Profile Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            We couldn't locate the diagnostic dossier for student ID <code className="font-mono">{studentId}</code>.
          </p>
        </div>
      </div>
    );
  }

  const { student, academicHistory, attendanceTrends, riskFactors, interventions } = profile;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/advisor/caseload"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Caseload Matrix
        </Link>

        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
          Student 360° Diagnostic Dossier
        </span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-2xl border-2 border-indigo-400/30 shadow-lg">
                {student.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {getAcademicStatusBadge(student.academicStatus)}
                {getRiskBadge(student.riskLevel)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {student.fullName}
              </h1>
              <div className="text-xs text-slate-300 font-mono flex items-center gap-2 flex-wrap">
                <span>ID: {student.studentNumber}</span>
                <span>&bull;</span>
                <span>{student.programName} ({student.programCode})</span>
                <span>&bull;</span>
                <span>Sem {student.currentSemester}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`mailto:${student.email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Email Student</span>
            </a>

            <button
              onClick={() => setIsInterventionModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Support Case</span>
            </button>
          </div>
        </div>

        {/* Hero KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-900/40 relative z-10 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-slate-400 font-medium">Cumulative GPA</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {student.gpa.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-slate-400 font-medium">Overall Attendance Rate</span>
            <div
              className={`text-2xl font-black mt-0.5 ${
                student.attendanceRate < 75 ? 'text-rose-400' : 'text-blue-400'
              }`}
            >
              {student.attendanceRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-slate-400 font-medium">Total Credits Earned</span>
            <div className="text-2xl font-black text-slate-100 mt-0.5">
              {profile.totalCreditsEarned} Credits
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-slate-400 font-medium">Open Support Cases</span>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {student.openInterventionsCount} Active Case{student.openInterventionsCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): Performance, Attendance & Interventions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Grade History Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Academic Module Performance & Grades
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {academicHistory.length} Enrolled / Completed Modules
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Module Code & Title</th>
                    <th className="py-3.5 px-4 text-center">Credits</th>
                    <th className="py-3.5 px-4 text-center">Score %</th>
                    <th className="py-3.5 px-4 text-center">Grade</th>
                    <th className="py-3.5 px-4 text-center">Attendance</th>
                    <th className="py-3.5 px-4">Diagnostic Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {academicHistory.map((m) => (
                    <tr key={m.moduleId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{m.moduleCode}</div>
                        <div className="text-slate-500 text-[11px]">{m.moduleTitle}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {m.creditHours}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold">
                        {m.currentGradeScore !== undefined ? `${m.currentGradeScore.toFixed(1)}%` : '&mdash;'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {m.letterGrade ? (
                          <span className="px-2.5 py-1 rounded font-black text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {m.letterGrade}
                          </span>
                        ) : (
                          '&mdash;'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={m.attendanceRate < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                          {m.attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {m.riskAlert ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
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

          {/* Attendance Breakdown Progress */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Weekly Attendance Trend Tracking
            </h2>

            <div className="space-y-3">
              {attendanceTrends.map((at, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{at.week}</span>
                    <span className={at.attendanceRate < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                      {at.attendanceRate}% ({at.sessionsAttended} / {at.totalSessions} sessions attended)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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

          {/* Support Intervention History */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Support Intervention Case History ({interventions.length})
              </h2>

              <button
                onClick={() => setIsInterventionModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Log Case
              </button>
            </div>

            {interventions.length > 0 ? (
              <div className="space-y-3">
                {interventions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {item.interventionType.replace('_', ' ')}
                        </span>
                        {getInterventionStatusBadge(item.status)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {item.reason}
                    </p>

                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 italic">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>
                        Initiated by: <strong>{item.initiatorName}</strong> ({item.initiatorRole})
                      </span>
                      {item.followUpDate && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          Follow-up: {item.followUpDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No Support Cases Logged
                </div>
                <p className="text-xs text-slate-500">
                  No support cases recorded for this student yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width): Risk Radar & Confidential Notes */}
        <div className="space-y-6">
          {/* Risk Factors Radar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Flagged Risk Factors ({riskFactors.length})
            </h2>

            {riskFactors.length > 0 ? (
              <div className="space-y-3">
                {riskFactors.map((rf) => (
                  <div
                    key={rf.id}
                    className={`p-4 rounded-2xl border ${
                      rf.severity === 'CRITICAL'
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                        : rf.severity === 'HIGH'
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rf.category}
                      </span>
                      {getRiskBadge(rf.severity)}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-2">
                      {rf.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {rf.description}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono mt-2">
                      Detected on {rf.detectedAt}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Zero Risk Factor Alerts
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Academic performance & attendance are within safety bounds.
                </p>
              </div>
            )}
          </div>

          {/* Confidential Advisor Notes Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Advisor Confidential Notes
            </h2>
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{profile.advisorNotes || 'No notes added for this student dossier.'}"
            </div>
          </div>
        </div>
      </div>

      {/* Log Intervention Modal */}
      <AcademicInterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        preselectedStudent={student}
        onSuccess={handleInterventionCreated}
      />
    </div>
  );
}
