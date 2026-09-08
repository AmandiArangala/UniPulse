'use client';

import React from 'react';
import { ModuleGradeSummary } from '@/types/student';

interface AssessmentBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: ModuleGradeSummary;
}

export function AssessmentBreakdownModal({
  isOpen,
  onClose,
  module,
}: AssessmentBreakdownModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase">{module.moduleCode}</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{module.moduleTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-500">Assessment Breakdown Modal Placeholder</p>
      </div>
    </div>
  );
}

