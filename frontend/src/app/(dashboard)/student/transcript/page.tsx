'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { studentService, mockGpaSummary, mockTrajectory } from '@/lib/student-service';
import {
  StudentGpaSummary,
  TargetGpaProjection,
  StudentProgramDetails,
} from '@/types/student';
import {
  GraduationCap,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Award,
  Calendar,
  Building,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function UnofficialTranscriptPage() {
  const { user } = useAuth();

  const [gpaSummary, setGpaSummary] = useState<StudentGpaSummary>(mockGpaSummary);
  const [trajectory, setTrajectory] = useState<TargetGpaProjection>(mockTrajectory);
  const [programDetails, setProgramDetails] = useState<StudentProgramDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTranscriptData = async () => {
      setIsLoading(true);
      try {
        const studentId = user.studentId || user.id || 'ST-2024-8842';
        const [gpa, traj, prog] = await Promise.all([
          studentService.getGpaSummary(studentId),
          studentService.getDegreeClassTrajectory(studentId),
          studentService.getStudentProgramDetails(studentId),
        ]);
        setGpaSummary(gpa);
        setTrajectory(traj);
        setProgramDetails(prog);
      } catch {
        // Fallbacks already in studentService
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscriptData();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    // Generate CSV content
    const headers = ['Semester', 'Course Code', 'Course Title', 'Credits', 'GPA Course', 'Letter Grade', 'Grade Point', 'Quality Points'];
    const rows: string[][] = [];

    gpaSummary.semesterReports.forEach((sem) => {
      sem.modules.forEach((mod) => {
        const gp = mod.gradePoint ?? 0;
        const qp = (gp * mod.creditHours).toFixed(2);
        rows.push([
          `"${sem.semesterName}"`,
          `"${mod.moduleCode}"`,
          `"${mod.moduleTitle}"`,
          `${mod.creditHours}`,
          `${mod.isGpa ? 'Yes' : 'No'}`,
          `"${mod.letterGrade || 'IP'}"`,
          `${gp}`,
          `${qp}`,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transcript_${gpaSummary.studentNumber || 'student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Export Downloaded', {
      description: 'Unofficial academic transcript data exported to CSV format.',
    });
  };

  const getDegreeClassLabel = (degClass?: string) => {
    switch (degClass) {
      case 'FIRST_CLASS':
        return 'First Class Honours (Distinction)';
      case 'SECOND_UPPER':
        return 'Second Class Honours (Upper Division)';
      case 'SECOND_LOWER':
        return 'Second Class Honours (Lower Division)';
      case 'GENERAL_PASS':
        return 'General Degree (Pass)';
      default:
        return 'Second Class Honours (Upper Division)';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Action Navigation Bar (Hidden during Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Academic Pulse</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center space-x-1.5 shadow-md shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Transcript Document Container */}
      <div
        id="transcript-document"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none relative overflow-hidden"
      >
        {/* Subtle Watermark for Official Academic Document */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <GraduationCap className="w-[500px] h-[500px] text-slate-900" />
        </div>

        {/* Institution Letterhead Header */}
        <div className="border-b-2 border-indigo-900 pb-6 mb-6 space-y-2 text-center">
          <div className="flex items-center justify-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-indigo-950 uppercase">
              UniPulse University
            </span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Office of the University Registrar • Academic Records & Examinations
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-wide pt-2 uppercase">
            Unofficial Academic Transcript & Grade Report
          </h1>
          <p className="text-[11px] text-slate-400">
            Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • For Internal Academic Advising & Student Verification Only
          </p>
        </div>

        {/* Student Information Details Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-8">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900">{gpaSummary.studentName || user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Student Registration No:</span>
              <span className="font-mono font-bold text-indigo-900">{gpaSummary.studentNumber || 'ST-2024-8842'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Degree Program:</span>
              <span className="font-bold text-slate-900 text-right">{gpaSummary.programName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Faculty:</span>
              <span className="font-medium text-slate-800">{programDetails?.facultyName || 'Faculty of Computing & IT'}</span>
            </div>
          </div>

          <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Enrollment Year:</span>
              <span className="font-bold text-slate-900">{programDetails?.enrollmentYear || 2024}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Current Semester Level:</span>
              <span className="font-bold text-slate-900">Semester {gpaSummary.currentSemester || 4}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Academic Standing:</span>
              <span className="font-bold text-emerald-700">Good Standing</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Classification Trajectory:</span>
              <span className="font-bold text-indigo-900">{getDegreeClassLabel(gpaSummary.academicDegreeClass)}</span>
            </div>
          </div>
        </div>

        {/* Semester-by-Semester Tables */}
        <div className="space-y-8 mb-8">
          {gpaSummary.semesterReports.map((sem, idx) => {
            const semQualityPoints = sem.modules.reduce((acc, m) => {
              const gp = m.gradePoint ?? 0;
              return acc + (m.isGpa ? gp * m.creditHours : 0);
            }, 0);

            return (
              <div key={sem.semesterId || idx} className="space-y-2 page-break-inside-avoid">
                {/* Semester Heading */}
                <div className="flex items-center justify-between border-b border-indigo-900/40 pb-1.5">
                  <h3 className="font-bold text-sm text-indigo-950 uppercase tracking-wide">
                    {sem.semesterName} <span className="text-slate-400 font-normal">({sem.academicYear})</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-600">
                    Term SGPA: <span className="font-black text-indigo-900">{sem.sgpa ? sem.sgpa.toFixed(2) : '3.32'}</span>
                  </span>
                </div>

                {/* Course Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                      <th className="py-2 px-2.5 w-24">Course Code</th>
                      <th className="py-2 px-2.5">Course Title</th>
                      <th className="py-2 px-2 text-center w-16">Credits</th>
                      <th className="py-2 px-2 text-center w-16">Type</th>
                      <th className="py-2 px-2 text-center w-16">Grade</th>
                      <th className="py-2 px-2 text-right w-16">Point</th>
                      <th className="py-2 px-2.5 text-right w-20">Quality Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {sem.modules.map((mod) => {
                      const gp = mod.gradePoint ?? 0;
                      const qp = mod.isGpa ? (gp * mod.creditHours).toFixed(2) : '—';

                      return (
                        <tr key={mod.moduleId || mod.moduleCode} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-bold font-mono text-indigo-950">
                            {mod.moduleCode}
                          </td>
                          <td className="py-2 px-2.5 font-medium text-slate-800">
                            {mod.moduleTitle}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-700">
                            {mod.creditHours}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="text-[10px] font-bold text-slate-500">
                              {mod.isGpa ? 'GPA' : 'NGPA'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-900">
                            {mod.letterGrade || 'In Progress'}
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-slate-700">
                            {mod.gradePoint !== undefined ? mod.gradePoint.toFixed(1) : '—'}
                          </td>
                          <td className="py-2 px-2.5 text-right font-semibold text-slate-900">
                            {qp}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-[11px] text-slate-700 border-t border-slate-200">
                      <td colSpan={2} className="py-1.5 px-2.5">
                        Semester Summary Totals:
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        {sem.semesterGpaCredits + sem.semesterNgpaCredits}
                      </td>
                      <td colSpan={2} className="py-1.5 px-2 text-center text-slate-500">
                        GPA Credits: {sem.semesterGpaCredits}
                      </td>
                      <td colSpan={2} className="py-1.5 px-2.5 text-right text-indigo-950">
                        Quality Pts: {semQualityPoints.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>

        {/* Cumulative Degree Summary Card */}
        <div className="border-t-2 border-indigo-950 pt-6 space-y-4 page-break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm uppercase tracking-wider text-indigo-950">
              Cumulative Academic Performance Record
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Good Academic Standing
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-center">
            <div className="p-2 bg-white rounded-lg border border-indigo-100 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Degree Total Credits</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">120</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-indigo-100 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Earned GPA Credits</div>
              <div className="text-xl font-black text-indigo-900 mt-0.5">{gpaSummary.totalEarnedGpaCredits || 64}</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-indigo-100 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Earned NGPA Credits</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{gpaSummary.totalEarnedNgpaCredits || 8}</div>
            </div>
            <div className="p-2 bg-indigo-900 text-white rounded-lg shadow-xs">
              <div className="text-[10px] font-bold text-indigo-200 uppercase">Cumulative CGPA</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{gpaSummary.cgpa ? gpaSummary.cgpa.toFixed(2) : '3.24'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">Degree Classification Standing:</span>
              <span className="font-black text-indigo-950">{getDegreeClassLabel(gpaSummary.academicDegreeClass)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Degree classification is determined upon completion of all 120 credits in accordance with University Academic Regulations.
            </p>
          </div>
        </div>

        {/* Verification & Registrar Sign-off Box */}
        <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-500 page-break-inside-avoid">
          <div className="space-y-1">
            <div className="font-bold text-slate-700 uppercase">Transcript Security Notice:</div>
            <p>
              This document is an unofficial copy generated directly from the UniPulse Academic Information System. Official transcripts bearing the University embossed seal may be requested via the Registrar Portal.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-2 flex flex-col justify-end">
            <div className="h-10 border-b border-slate-300 w-48 ml-auto flex items-end justify-center pb-1">
              <span className="font-serif italic text-slate-400 text-xs">Electronic Verification</span>
            </div>
            <div className="font-bold text-slate-700">Deputy Registrar (Examinations & Records)</div>
            <div className="text-[10px] text-slate-400">UniPulse Academic Operations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

