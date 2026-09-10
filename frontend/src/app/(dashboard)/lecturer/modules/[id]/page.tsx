'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  BarChart3,
  Sliders,
  GraduationCap,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AssignedModule, EnrolledStudentRosterItem, GradeDistributionData, AssessmentAuthoringItem } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { StudentRosterTable } from '@/components/lecturer/StudentRosterTable';
import { GradeDistributionChart } from '@/components/lecturer/GradeDistributionChart';
import { toast } from 'sonner';

interface ModuleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const resolvedParams = use(params);
  const moduleId = resolvedParams.id;

  const [module, setModule] = useState<AssignedModule | null>(null);
  const [roster, setRoster] = useState<EnrolledStudentRosterItem[]>([]);
  const [distribution, setDistribution] = useState<GradeDistributionData | null>(null);
  const [assessments, setAssessments] = useState<AssessmentAuthoringItem[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'distribution' | 'assessments'>('roster');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const modules = await lecturerService.getAssignedModules();
      const match = modules.find((m) => m.id === moduleId) || modules[0];
      setModule(match);

      const rosterData = await lecturerService.getModuleRoster(moduleId);
      setRoster(rosterData);

      const distData = await lecturerService.getGradeDistribution(moduleId);
      setDistribution(distData);

      const assData = await lecturerService.getModuleAssessments(moduleId);
      setAssessments(assData);
    } catch (err) {
      toast.error('Failed to load module details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlagStudent = (student: EnrolledStudentRosterItem) => {
    toast.success(`Academic Intervention triggered for ${student.studentName}`, {
      description: `Flagged for advisor review: ${student.riskLevel} Risk level in ${module?.moduleCode || 'module'}.`,
    });
  };

  if (isLoading || !module) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading module analytics & roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <Link href="/lecturer/modules" className="hover:text-indigo-600 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> Assigned Modules
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">{module.moduleCode}</span>
      </div>

      {/* Module Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {module.moduleCode}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {module.semesterName} • {module.creditHours} Credit Hours
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {module.moduleTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assigned Lecturer: <span className="font-semibold text-slate-800 dark:text-slate-200">Dr. Sarah Jenkins</span>
            </p>
          </div>

          {/* Action Button Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/lecturer/marks?module=${module.id}`}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open Marks Entry Grid</span>
            </Link>
            <Link
              href={`/lecturer/assessments?module=${module.id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Sliders className="w-4 h-4 text-purple-500" />
              <span>Assessment Authoring</span>
            </Link>
            <Link
              href={`/lecturer/attendance?module=${module.id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Attendance Tracker</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Enrolled Students</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-indigo-500" /> {roster.length}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Class Mean Score</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <Award className="w-4 h-4 text-amber-500" /> {module.averageGradeScore}% ({module.averageGradeLetter})
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Pass Rate</span>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> {module.passRatePercentage}%
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Assessment Allocation</span>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> CA {module.caWeightPercentage}% | WE {module.weWeightPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Roster ({roster.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('distribution')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'distribution'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Grade Distribution Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'assessments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Assessments Overview ({assessments.length})</span>
        </button>
      </div>

      {/* Tab 1: Student Roster */}
      {activeTab === 'roster' && (
        <StudentRosterTable
          roster={roster}
          moduleCode={module.moduleCode}
          onFlagStudent={handleFlagStudent}
        />
      )}

      {/* Tab 2: Grade Distribution */}
      {activeTab === 'distribution' && distribution && (
        <GradeDistributionChart distribution={distribution} />
      )}

      {/* Tab 3: Assessments Overview */}
      {activeTab === 'assessments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assessment Structure ({module.moduleCode})
            </h3>
            <Link
              href={`/lecturer/assessments?module=${module.id}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Edit Assessment Weights →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assessments.map((ass) => (
              <div key={ass.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                      {ass.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ass.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ass.description}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {ass.weightPercentage}% Weight
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Max Score: {ass.maxScore} | Due: {ass.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
