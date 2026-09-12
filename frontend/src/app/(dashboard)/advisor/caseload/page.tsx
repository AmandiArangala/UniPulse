'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AdvisorCaseloadHeader } from '@/components/advisor/AdvisorCaseloadHeader';
import { AdvisorStudentCaseloadTable } from '@/components/advisor/AdvisorStudentCaseloadTable';
import { Student360ProfileModal } from '@/components/advisor/Student360ProfileModal';
import { AcademicInterventionModal } from '@/components/advisor/AcademicInterventionModal';
import {
  AssignedStudent,
  AdvisorCaseloadSummary,
  AcademicStatus,
  RiskLevel,
  AcademicInterventionItem,
} from '@/types/advisor';
import {
  getAdvisorCaseloadSummary,
  getAssignedStudents,
} from '@/lib/advisor-service';
import { toast } from 'sonner';

export default function AdvisorCaseloadMasterPage() {
  const [summary, setSummary] = useState<AdvisorCaseloadSummary | null>(null);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Table Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AcademicStatus | 'ALL'>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');

  // Modal States
  const [studentFor360, setStudentFor360] = useState<AssignedStudent | null>(null);
  const [studentForIntervention, setStudentForIntervention] = useState<AssignedStudent | null>(null);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);

  // Load Data
  const loadCaseloadData = async () => {
    setLoading(true);
    try {
      const [sumData, stuData] = await Promise.all([
        getAdvisorCaseloadSummary(),
        getAssignedStudents(),
      ]);
      setSummary(sumData);
      setStudents(stuData);
    } catch (err) {
      console.error('Failed to load advisor caseload data:', err);
      toast.error('Failed to load caseload metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseloadData();
  }, []);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.programCode.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.academicStatus === statusFilter);
    }

    if (riskFilter !== 'ALL') {
      result = result.filter((s) => s.riskLevel === riskFilter);
    }

    return result;
  }, [students, searchQuery, statusFilter, riskFilter]);

  const handleOpenInterventionModal = (student?: AssignedStudent) => {
    if (student) {
      setStudentForIntervention(student);
    } else {
      setStudentForIntervention(null);
    }
    setIsInterventionModalOpen(true);
  };

  const handleInterventionCreated = (newIntervention: AcademicInterventionItem) => {
    toast.success(`Academic support case logged for ${newIntervention.studentName}!`, {
      description: `Intervention type: ${newIntervention.interventionType.replace('_', ' ')} (Priority: ${newIntervention.priority})`,
    });

    // Refresh caseload data
    loadCaseloadData();
  };

  const handleFilterAtRiskQuickAction = () => {
    setRiskFilter('HIGH');
    setStatusFilter('ALL');
    toast.info('Filtered view to High/Critical Risk students.');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header & KPI Summary */}
      {summary ? (
        <AdvisorCaseloadHeader
          summary={summary}
          onOpenInterventionModal={() => handleOpenInterventionModal()}
          onFilterAtRiskClick={handleFilterAtRiskQuickAction}
        />
      ) : (
        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}

      {/* Main Student Directory Data Table */}
      {loading ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading assigned student caseload matrix...
          </div>
        </div>
      ) : (
        <AdvisorStudentCaseloadTable
          students={filteredStudents}
          onSelectStudent={(stu) => setStudentFor360(stu)}
          onLogIntervention={(stu) => handleOpenInterventionModal(stu)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          riskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
        />
      )}

      {/* Student 360 Diagnostic Modal */}
      <Student360ProfileModal
        student={studentFor360}
        isOpen={Boolean(studentFor360)}
        onClose={() => setStudentFor360(null)}
        onLogIntervention={(stu) => handleOpenInterventionModal(stu)}
      />

      {/* Log Academic Intervention Modal */}
      <AcademicInterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        preselectedStudent={studentForIntervention}
        assignedStudents={students}
        onSuccess={handleInterventionCreated}
      />
    </div>
  );
}
