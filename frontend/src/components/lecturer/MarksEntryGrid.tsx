'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { MarksEntryRow, AssessmentAuthoringItem } from '@/types/lecturer';
import { toast } from 'sonner';

interface MarksEntryGridProps {
  assessments: AssessmentAuthoringItem[];
  initialRows: MarksEntryRow[];
  onSaveBatch: (modifiedMarks: { studentId: string; assessmentId: string; score: number | null }[]) => Promise<void>;
}

export function MarksEntryGrid({ assessments, initialRows, onSaveBatch }: MarksEntryGridProps) {
  const [rows, setRows] = useState<MarksEntryRow[]>(initialRows);
  const [activeCell, setActiveCell] = useState<{ studentId: string; assessmentId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [modifiedCellKeys, setModifiedCellKeys] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    if (activeCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [activeCell]);

  // Compute calculated grades on-the-fly when rows change
  const processedRows = useMemo(() => {
    return rows.map((row) => {
      let totalCaScore = 0;
      let totalWeScore = 0;

      assessments.forEach((ass) => {
        const score = row.marks[ass.id];
        if (score !== null && score !== undefined && !isNaN(score)) {
          const weightedContrib = (score / ass.maxScore) * ass.weightPercentage;
          if (ass.type === 'FINAL_EXAM') {
            totalWeScore += weightedContrib;
          } else {
            totalCaScore += weightedContrib;
          }
        }
      });

      const totalScore = Math.round((totalCaScore + totalWeScore) * 100) / 100;
      let letter = 'F';
      if (totalScore >= 90) letter = 'A+';
      else if (totalScore >= 85) letter = 'A';
      else if (totalScore >= 80) letter = 'A-';
      else if (totalScore >= 75) letter = 'B+';
      else if (totalScore >= 70) letter = 'B';
      else if (totalScore >= 65) letter = 'B-';
      else if (totalScore >= 60) letter = 'C+';
      else if (totalScore >= 55) letter = 'C';
      else if (totalScore >= 50) letter = 'D';

      return {
        ...row,
        calculatedCaScore: Math.round(totalCaScore * 100) / 100,
        calculatedWeScore: Math.round(totalWeScore * 100) / 100,
        calculatedTotalScore: totalScore,
        calculatedLetter: letter,
      };
    });
  }, [rows, assessments]);

  // Filtered Rows for display
  const filteredRows = useMemo(() => {
    return processedRows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedRows, searchTerm]);

  // Double click or enter to start cell edit
  const startCellEdit = (studentId: string, assessmentId: string, currentScore: number | null) => {
    setActiveCell({ studentId, assessmentId });
    setEditValue(currentScore !== null && currentScore !== undefined ? String(currentScore) : '');
  };

  // Commit edited cell value
  const commitCellEdit = () => {
    if (!activeCell) return;
    const { studentId, assessmentId } = activeCell;
    const ass = assessments.find((a) => a.id === assessmentId);
    const maxScore = ass ? ass.maxScore : 100;

    let numVal: number | null = null;
    if (editValue.trim() !== '') {
      const parsed = parseFloat(editValue);
      if (isNaN(parsed)) {
        toast.error(`Invalid numeric score '${editValue}'`);
        setActiveCell(null);
        return;
      }
      if (parsed < 0 || parsed > maxScore) {
        toast.error(`Score must be between 0 and ${maxScore}`);
        setActiveCell(null);
        return;
      }
      numVal = parsed;
    }

    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r.studentId === studentId) {
          return {
            ...r,
            marks: {
              ...r.marks,
              [assessmentId]: numVal,
            },
          };
        }
        return r;
      })
    );

    const cellKey = `${studentId}:${assessmentId}`;
    setModifiedCellKeys((prev) => new Set(prev).add(cellKey));
    setActiveCell(null);
  };

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    const { studentId, assessmentId } = activeCell;

    const currentRowIndex = filteredRows.findIndex((r) => r.studentId === studentId);
    const currentAssIndex = assessments.findIndex((a) => a.id === assessmentId);

    if (e.key === 'Enter') {
      e.preventDefault();
      commitCellEdit();
      // Move to next student row down
      if (currentRowIndex < filteredRows.length - 1) {
        const nextStudent = filteredRows[currentRowIndex + 1];
        startCellEdit(nextStudent.studentId, assessmentId, nextStudent.marks[assessmentId]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitCellEdit();
      if (e.shiftKey) {
        // Move left
        if (currentAssIndex > 0) {
          const prevAss = assessments[currentAssIndex - 1];
          const studentRow = filteredRows[currentRowIndex];
          startCellEdit(studentRow.studentId, prevAss.id, studentRow.marks[prevAss.id]);
        }
      } else {
        // Move right
        if (currentAssIndex < assessments.length - 1) {
          const nextAss = assessments[currentAssIndex + 1];
          const studentRow = filteredRows[currentRowIndex];
          startCellEdit(studentRow.studentId, nextAss.id, studentRow.marks[nextAss.id]);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setActiveCell(null);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      commitCellEdit();
      if (currentRowIndex < filteredRows.length - 1) {
        const nextStudent = filteredRows[currentRowIndex + 1];
        startCellEdit(nextStudent.studentId, assessmentId, nextStudent.marks[assessmentId]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      commitCellEdit();
      if (currentRowIndex > 0) {
        const prevStudent = filteredRows[currentRowIndex - 1];
        startCellEdit(prevStudent.studentId, assessmentId, prevStudent.marks[assessmentId]);
      }
    }
  };

  const handleSaveAll = async () => {
    if (modifiedCellKeys.size === 0) return;
    setIsSaving(true);

    const modifiedPayload: { studentId: string; assessmentId: string; score: number | null }[] = [];
    modifiedCellKeys.forEach((key) => {
      const [studentId, assessmentId] = key.split(':');
      const row = rows.find((r) => r.studentId === studentId);
      if (row) {
        modifiedPayload.push({
          studentId,
          assessmentId,
          score: row.marks[assessmentId] ?? null,
        });
      }
    });

    try {
      await onSaveBatch(modifiedPayload);
      setModifiedCellKeys(new Set());
      toast.success('Marks saved successfully!', {
        description: `Updated ${modifiedPayload.length} student mark entries.`,
      });
    } catch {
      toast.error('Failed to save batch marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setRows(initialRows);
    setModifiedCellKeys(new Set());
    toast.info('Reverted all unsaved mark changes');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
      {/* Top Header & Search Bar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            <span>Spreadsheet Marks Entry Grid</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full keyboard navigation: Use <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Arrow Keys</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Tab</kbd>, and <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Esc</kbd>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Dirty Batch Notification Bar */}
      {modifiedCellKeys.size > 0 && (
        <div className="p-3 px-5 bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs animate-fade-in">
          <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            <span>Unsaved Changes: {modifiedCellKeys.size} modified cell entries</span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet Data Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="py-3.5 px-4 sticky left-0 bg-slate-50 dark:bg-slate-800/90 z-10 w-32 border-r border-slate-200 dark:border-slate-800">
                Student ID
              </th>
              <th className="py-3.5 px-4 sticky left-32 bg-slate-50 dark:bg-slate-800/90 z-10 w-48 border-r border-slate-200 dark:border-slate-800">
                Student Name
              </th>

              {/* Assessment Column Headers */}
              {assessments.map((ass) => (
                <th key={ass.id} className="py-3.5 px-4 min-w-[140px] text-center border-r border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {ass.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {ass.weightPercentage}% Weight (Max {ass.maxScore})
                  </div>
                </th>
              ))}

              {/* Calculated Summary Headers */}
              <th className="py-3.5 px-4 w-24 text-center bg-indigo-50/50 dark:bg-indigo-950/30">
                CA Score
              </th>
              <th className="py-3.5 px-4 w-28 text-center bg-emerald-50/50 dark:bg-emerald-950/30">
                Total Score
              </th>
              <th className="py-3.5 px-4 w-20 text-center bg-amber-50/50 dark:bg-amber-950/30">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredRows.map((row) => (
              <tr key={row.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                {/* Student ID */}
                <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                  {row.studentNumber}
                </td>

                {/* Student Name */}
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white sticky left-32 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 truncate max-w-[180px]">
                  {row.studentName}
                </td>

                {/* Editable Assessment Mark Cells */}
                {assessments.map((ass) => {
                  const score = row.marks[ass.id];
                  const isEditing = activeCell?.studentId === row.studentId && activeCell?.assessmentId === ass.id;
                  const isModified = modifiedCellKeys.has(`${row.studentId}:${ass.id}`);

                  return (
                    <td
                      key={ass.id}
                      onClick={() => startCellEdit(row.studentId, ass.id, score ?? null)}
                      className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-800 cursor-pointer transition-all relative ${
                        isEditing
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/80'
                          : isModified
                          ? 'bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-800 dark:text-amber-300'
                          : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30'
                      }`}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitCellEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full text-center py-1 px-1 text-xs font-extrabold rounded bg-white dark:bg-slate-800 border border-indigo-500 text-indigo-600 dark:text-indigo-300 focus:outline-none"
                        />
                      ) : (
                        <span className={`font-bold ${score !== null && score !== undefined ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                          {score !== null && score !== undefined ? score : '-'}
                        </span>
                      )}

                      {/* Small Modified Badge Indicator */}
                      {isModified && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </td>
                  );
                })}

                {/* Calculated CA Score */}
                <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200 bg-indigo-50/30 dark:bg-indigo-950/20">
                  {row.calculatedCaScore?.toFixed(1) || '0.0'}
                </td>

                {/* Calculated Total Score */}
                <td className="py-3 px-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                  {row.calculatedTotalScore?.toFixed(1) || '0.0'}%
                </td>

                {/* Calculated Grade Letter */}
                <td className="py-3 px-4 text-center bg-amber-50/30 dark:bg-amber-950/20">
                  <span className="px-2 py-0.5 rounded font-extrabold text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    {row.calculatedLetter || 'F'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No students found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
