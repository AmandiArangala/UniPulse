'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { CsvParseResult, EnrolledStudentRosterItem, AssessmentAuthoringItem } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { toast } from 'sonner';

interface CsvMarksUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentAuthoringItem;
  roster: EnrolledStudentRosterItem[];
  onImportSuccess: (importedMarks: { studentNumber: string; score: number }[]) => void;
}

export function CsvMarksUploader({
  isOpen,
  onClose,
  assessment,
  roster,
  onImportSuccess,
}: CsvMarksUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent = lecturerService.exportCsvTemplate(assessment.title, roster);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${assessment.title.replace(/[^a-z0-9]/gi, '_')}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV template downloaded');
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = lecturerService.parseCsvMarks(text, assessment.maxScore);
      setParseResult(result);
      if (result.invalidRows > 0) {
        toast.warning(`CSV parsed with ${result.invalidRows} invalid row errors`);
      } else {
        toast.success(`Successfully parsed ${result.validRows} valid mark rows`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!parseResult || parseResult.validRows === 0) return;

    const validMarks = parseResult.parsedRows
      .filter((r) => r.isValid)
      .map((r) => ({
        studentNumber: r.studentNumber,
        score: r.score,
      }));

    onImportSuccess(validMarks);
    toast.success(`Imported ${validMarks.length} student marks into grid`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Import CSV Marks Spreadsheet
              </h3>
              <p className="text-xs text-slate-500">
                Uploading for: <strong className="text-slate-800 dark:text-slate-200">{assessment.title}</strong> (Max: {assessment.maxScore})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-5 space-y-4">
          {/* Download Template Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Need a CSV template?</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pre-populated with enrolled student registration numbers and titles.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* File Dropzone */}
          {!parseResult ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Drag & drop your CSV file here
              </h4>
              <p className="text-xs text-slate-500 mt-1">Or click to browse from your computer</p>
            </div>
          ) : (
            /* Parse Preview Summary */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-medium">Total Rows</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {parseResult.totalRows}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Valid Marks</div>
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {parseResult.validRows}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                  <div className="text-xs text-rose-700 dark:text-rose-300 font-medium">Invalid Errors</div>
                  <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    {parseResult.invalidRows}
                  </div>
                </div>
              </div>

              {/* Parsed Rows Preview Table */}
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Student ID</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parseResult.parsedRows.map((r, idx) => (
                      <tr key={idx} className={r.isValid ? '' : 'bg-rose-50/50 dark:bg-rose-950/30'}>
                        <td className="p-2.5 font-mono text-slate-400">{r.rowNumber}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {r.studentNumber}
                        </td>
                        <td className="p-2.5 font-extrabold text-indigo-600 dark:text-indigo-400">
                          {r.score}
                        </td>
                        <td className="p-2.5">
                          {r.isValid ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold flex items-center gap-1" title={r.errorReason}>
                              <AlertCircle className="w-3.5 h-3.5" /> {r.errorReason || 'Error'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setParseResult(null)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  ← Upload a different file
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!parseResult || parseResult.validRows === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md ${
              parseResult && parseResult.validRows > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Import {parseResult ? parseResult.validRows : 0} Valid Marks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
