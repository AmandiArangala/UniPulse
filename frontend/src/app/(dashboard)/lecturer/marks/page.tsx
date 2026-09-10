'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileSpreadsheet,
  BookOpen,
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { AssignedModule, AssessmentAuthoringItem, MarksEntryRow } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { MarksEntryGrid } from '@/components/lecturer/MarksEntryGrid';
import { CsvMarksUploader } from '@/components/lecturer/CsvMarksUploader';
import { toast } from 'sonner';

export default function LecturerMarksPage() {
  const searchParams = useSearchParams();
  const preselectedModuleId = searchParams.get('module');

  const [modules, setModules] = useState<AssignedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [assessments, setAssessments] = useState<AssessmentAuthoringItem[]>([]);
  const [gridRows, setGridRows] = useState<MarksEntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedAssessmentForCsv, setSelectedAssessmentForCsv] = useState<AssessmentAuthoringItem | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getAssignedModules();
      setModules(data);
      if (preselectedModuleId && data.some((m) => m.id === preselectedModuleId)) {
        setSelectedModuleId(preselectedModuleId);
      } else if (data.length > 0) {
        setSelectedModuleId(data[0].id);
      }
    } catch {
      toast.error('Failed to load assigned modules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModuleId) {
      loadGridData(selectedModuleId);
    }
  }, [selectedModuleId]);

  const loadGridData = async (modId: string) => {
    setIsLoading(true);
    try {
      const { assessments: assData, rows } = await lecturerService.getMarksGridData(modId);
      setAssessments(assData);
      setGridRows(rows);
      if (assData.length > 0) {
        setSelectedAssessmentForCsv(assData[0]);
      }
    } catch {
      toast.error('Failed to load marks grid data');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModule = useMemo(() => {
    return modules.find((m) => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const handleSaveBatch = async (
    modifiedMarks: { studentId: string; assessmentId: string; score: number | null }[]
  ) => {
    // Group by assessmentId
    const grouped: Record<string, { studentId: string; score: number | null }[]> = {};
    modifiedMarks.forEach((m) => {
      if (!grouped[m.assessmentId]) grouped[m.assessmentId] = [];
      grouped[m.assessmentId].push({ studentId: m.studentId, score: m.score });
    });

    for (const [assId, marksPayload] of Object.entries(grouped)) {
      await lecturerService.saveBatchMarks(assId, marksPayload);
    }

    // Update local grid state
    setGridRows((prevRows) =>
      prevRows.map((r) => {
        const updatedRowMarks = { ...r.marks };
        modifiedMarks.forEach((m) => {
          if (m.studentId === r.studentId) {
            updatedRowMarks[m.assessmentId] = m.score;
          }
        });
        return {
          ...r,
          marks: updatedRowMarks,
        };
      })
    );
  };

  const handleImportCsvSuccess = (importedMarks: { studentNumber: string; score: number }[]) => {
    if (!selectedAssessmentForCsv) return;
    const targetAssId = selectedAssessmentForCsv.id;

    setGridRows((prevRows) =>
      prevRows.map((row) => {
        const match = importedMarks.find((m) => m.studentNumber === row.studentNumber);
        if (match) {
          return {
            ...row,
            marks: {
              ...row.marks,
              [targetAssId]: match.score,
            },
          };
        }
        return row;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Lecturer Portal • Grading & Marks</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Spreadsheet Marks Entry Grid
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter, validate, and batch update student assessment marks with inline grade calculations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Module Dropdown */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="py-2.5 px-3.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.moduleCode} - {m.moduleTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Import CSV Trigger */}
          <button
            onClick={() => setIsCsvModalOpen(true)}
            disabled={assessments.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading spreadsheet marks grid...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Sliders className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Assessment Components Found</h3>
          <p className="text-sm text-slate-500 mt-1">Please author assessment components for {selectedModule?.moduleCode} before entering marks.</p>
        </div>
      ) : (
        <MarksEntryGrid
          assessments={assessments}
          initialRows={gridRows}
          onSaveBatch={handleSaveBatch}
        />
      )}

      {/* CSV Uploader Modal */}
      {selectedAssessmentForCsv && (
        <CsvMarksUploader
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          assessment={selectedAssessmentForCsv}
          roster={gridRows.map((r) => ({
            studentId: r.studentId,
            studentNumber: r.studentNumber,
            studentName: r.studentName,
            email: r.email,
            programCode: r.programCode,
            programName: '',
            enrollmentStatus: 'ENROLLED',
            attendancePercentage: 90,
            caCurrentScore: 30,
            caMaxScore: 40,
            projectedGradeLetter: 'A',
            riskLevel: 'LOW',
          }))}
          onImportSuccess={handleImportCsvSuccess}
        />
      )}
    </div>
  );
}
