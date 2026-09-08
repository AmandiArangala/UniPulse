'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { studentService, mockGpaSummary } from '@/lib/student-service';
import { StudentGpaSummary, SemesterGpaReport, ModuleGradeSummary } from '@/types/student';
import { AssessmentWeightGauge } from '@/components/student/AssessmentWeightGauge';
import { AssessmentBreakdownModal } from '@/components/student/AssessmentBreakdownModal';
import {
  BookOpen,
  Calendar,
  Search,
  Filter,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function EnrolledModulesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get('highlight');

  const [gpaSummary, setGpaSummary] = useState<StudentGpaSummary>(mockGpaSummary);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('sem-2026-s1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENROLLED' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected module for Assessment Breakdown modal
  const [selectedModule, setSelectedModule] = useState<ModuleGradeSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const studentId = user.studentId || user.id || 'ST-2024-8842';
        const data = await studentService.getGpaSummary(studentId);
        setGpaSummary(data);

        // Default to latest semester
        if (data.semesterReports && data.semesterReports.length > 0) {
          const latest = data.semesterReports[data.semesterReports.length - 1];
          setSelectedSemesterId(latest.semesterId);
        }
      } catch {
        // Fallback already embedded in studentService
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Current active semester report
  const activeSemesterReport: SemesterGpaReport | undefined = useMemo(() => {
    return (
      gpaSummary.semesterReports.find((r) => r.semesterId === selectedSemesterId) ||
      gpaSummary.semesterReports[gpaSummary.semesterReports.length - 1]
    );
  }, [gpaSummary, selectedSemesterId]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    if (!activeSemesterReport) return [];

    return activeSemesterReport.modules.filter((mod) => {
      const matchesSearch =
        mod.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mod.lecturerName && mod.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ENROLLED' && mod.enrollmentStatus !== 'COMPLETED') ||
        (statusFilter === 'COMPLETED' && mod.enrollmentStatus === 'COMPLETED');

      return matchesSearch && matchesStatus;
    });
  }, [activeSemesterReport, searchQuery, statusFilter]);

  // Auto-open highlighted module if present in URL
  useEffect(() => {
    if (highlightParam && activeSemesterReport) {
      const match = activeSemesterReport.modules.find(
        (m) => m.moduleCode.toLowerCase() === highlightParam.toLowerCase()
      );
      if (match) {
        setSelectedModule(match);
        setIsModalOpen(true);
      }
    }
  }, [highlightParam, activeSemesterReport]);

  const handleOpenBreakdown = (mod: ModuleGradeSummary) => {
    setSelectedModule(mod);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Curriculum & Assessments</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Enrolled Modules & Grade Breakdowns
          </h1>
          <p className="text-xs text-slate-300">
            {gpaSummary.programName} • Student ID: <span className="font-mono text-indigo-300">{gpaSummary.studentNumber}</span>
          </p>
        </div>

        {/* Semester Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-800/90 p-2 rounded-xl border border-slate-700">
          <Calendar className="w-4 h-4 text-indigo-400 ml-1" />
          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            className="bg-transparent font-bold text-xs text-white focus:outline-none cursor-pointer pr-2"
          >
            {gpaSummary.semesterReports.map((sem) => (
              <option key={sem.semesterId} value={sem.semesterId} className="bg-slate-900 text-white">
                {sem.semesterName} ({sem.academicYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Semester Key Metrics Banner */}
      {activeSemesterReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="unipulse-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Semester SGPA
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {activeSemesterReport.sgpa ? activeSemesterReport.sgpa.toFixed(2) : '3.32'}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 4.00</span>
            </div>
            <p className="text-[10px] text-slate-400">Term Weighted Average</p>
          </div>

          <div className="unipulse-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Modules
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeSemesterReport.modules.length} Courses
            </div>
            <p className="text-[10px] text-slate-400">Active Course Registrations</p>
          </div>

          <div className="unipulse-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Semester GPA Credits
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeSemesterReport.semesterGpaCredits} Credits
            </div>
            <p className="text-[10px] text-slate-400">Counts toward Cumulative CGPA</p>
          </div>

          <div className="unipulse-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Academic Standing
            </span>
            <div className="flex items-center space-x-1.5 pt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                Good Standing
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Normal Progression Status</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="unipulse-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by module code, title, or lecturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter:
          </span>
          {(['ALL', 'ENROLLED', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All Modules' : st === 'ENROLLED' ? 'Active / In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.map((mod) => {
          const gradedAssessmentsCount = mod.assessmentBreakdowns?.filter((a) => a.isPublished).length || 0;
          const totalAssessmentsCount = mod.assessmentBreakdowns?.length || 0;

          return (
            <div
              key={mod.moduleId || mod.moduleCode}
              className={`unipulse-card p-5 space-y-4 transition-all duration-200 hover:shadow-md ${
                highlightParam && highlightParam.toLowerCase() === mod.moduleCode.toLowerCase()
                  ? 'ring-2 ring-indigo-500 shadow-indigo-100 dark:shadow-none'
                  : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {mod.moduleCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mod.creditHours} Credits
                    </span>
                    {mod.isGpa ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        GPA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Non-GPA
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {mod.moduleTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lecturer: <span className="font-semibold">{mod.lecturerName || 'Faculty Instructor'}</span>
                  </p>
                </div>

                {/* Grade Badge */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-slate-400 uppercase">Grade</div>
                  <div className="flex items-baseline space-x-1 justify-end">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {mod.letterGrade || 'In Progress'}
                    </span>
                    {mod.gradePoint !== undefined && (
                      <span className="text-xs font-bold text-slate-400">({mod.gradePoint.toFixed(1)})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assessment Weight Distribution Gauge */}
              <AssessmentWeightGauge
                caWeight={mod.caWeightPercentage}
                weWeight={mod.weWeightPercentage}
                caScoreObtained={mod.caScoreObtained}
                weScoreObtained={mod.weScoreObtained}
                finalGrade={mod.finalGrade}
                letterGrade={mod.letterGrade}
                meetsComponentThreshold={mod.meetsComponentThreshold}
              />

              {/* Assessment Count & Actions Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {totalAssessmentsCount > 0
                      ? `${gradedAssessmentsCount} of ${totalAssessmentsCount} Assessments Graded`
                      : 'Continuous Assessment In Progress'}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenBreakdown(mod)}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                >
                  <span>Assessment Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="unipulse-card p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No modules match your filter
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or selecting a different academic semester.
          </p>
        </div>
      )}

      {/* Assessment Breakdown Dialog Modal */}
      {selectedModule && (
        <AssessmentBreakdownModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
        />
      )}
    </div>
  );
}

