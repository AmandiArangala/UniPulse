'use client';

import React, { useEffect } from 'react';
import { ModuleGradeSummary, AssessmentScoreBreakdown, AssessmentType } from '@/types/student';
import { AssessmentWeightGauge } from './AssessmentWeightGauge';
import {
  FileText,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  Layers,
  Sparkles,
  Scale,
  Calendar,
  X,
  TrendingUp,
} from 'lucide-react';

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
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getAssessmentTypeLabel = (type: AssessmentType) => {
    switch (type) {
      case 'QUIZ':
        return 'Online Quiz';
      case 'ASSIGNMENT':
        return 'Practical Assignment';
      case 'MIDTERM_EXAM':
        return 'Midterm Examination';
      case 'FINAL_EXAM':
        return 'Final Written Exam';
      case 'PROJECT':
        return 'Coursework Project';
      case 'LAB_PRACTICAL':
        return 'Laboratory Practical';
      case 'PRESENTATION':
        return 'Oral Presentation';
      default:
        return type;
    }
  };

  const getAssessmentTypeBadgeColor = (type: AssessmentType) => {
    switch (type) {
      case 'FINAL_EXAM':
      case 'MIDTERM_EXAM':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'PROJECT':
      case 'PRESENTATION':
        return 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ASSIGNMENT':
      case 'LAB_PRACTICAL':
        return 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'QUIZ':
      default:
        return 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const breakdowns = module.assessmentBreakdowns || [];
  const publishedAssessments = breakdowns.filter((a) => a.isPublished);
  const totalWeightedContribution = publishedAssessments.reduce(
    (acc, a) => acc + (a.weightedContribution || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {module.moduleCode}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {module.creditHours} Credit Hours
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {module.isGpa ? 'GPA Course' : 'Non-GPA'}
              </span>
            </div>
            <h2 className="font-bold text-xl text-slate-900 dark:text-white">
              {module.moduleTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instructor: <span className="font-semibold text-slate-700 dark:text-slate-300">{module.lecturerName || 'Faculty Instructor'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close breakdown"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assessment Weight Distribution Widget */}
        <AssessmentWeightGauge
          caWeight={module.caWeightPercentage}
          weWeight={module.weWeightPercentage}
          caScoreObtained={module.caScoreObtained}
          weScoreObtained={module.weScoreObtained}
          finalGrade={module.finalGrade}
          letterGrade={module.letterGrade}
          meetsComponentThreshold={module.meetsComponentThreshold}
        />

        {/* Assessments Breakdown Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-600" /> Assessment Components & Published Marks
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Current Cumulative: <span className="font-black text-indigo-600 dark:text-indigo-400">{totalWeightedContribution.toFixed(2)} pts</span>
            </span>
          </div>

          {breakdowns.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Component / Assessment</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3 text-center">Weight</th>
                    <th className="p-3 text-center">Raw Score</th>
                    <th className="p-3 text-center">Score %</th>
                    <th className="p-3 text-right">Weighted Pts</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {breakdowns.map((item) => {
                    const isPublished = item.isPublished ?? true;
                    return (
                      <tr
                        key={item.assessmentId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Title & Date */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.assessmentTitle}
                          </div>
                          {item.dueDate && (
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>Due / Held: {item.dueDate}</span>
                            </div>
                          )}
                        </td>

                        {/* Assessment Type Badge */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getAssessmentTypeBadgeColor(
                              item.assessmentType
                            )}`}
                          >
                            {getAssessmentTypeLabel(item.assessmentType)}
                          </span>
                        </td>

                        {/* Weight % */}
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {item.weightPercentage}%
                        </td>

                        {/* Raw Score / Max Score */}
                        <td className="p-3 text-center">
                          {isPublished && item.scoreObtained !== null && item.scoreObtained !== undefined ? (
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.scoreObtained} <span className="text-slate-400 font-normal">/ {item.maxScore}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Percentage Score */}
                        <td className="p-3 text-center">
                          {isPublished && item.percentageScore !== null && item.percentageScore !== undefined ? (
                            <span
                              className={`font-black ${
                                item.percentageScore >= 75
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : item.percentageScore >= 50
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {item.percentageScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Weighted Contribution Points */}
                        <td className="p-3 text-right">
                          {isPublished && item.weightedContribution !== null && item.weightedContribution !== undefined ? (
                            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                              +{item.weightedContribution.toFixed(2)} pts
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Publication Status */}
                        <td className="p-3 text-center">
                          {isPublished ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Marks</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Detailed assessment items have not yet been published by the course lecturer.
              </p>
              <p className="text-[11px] text-slate-400">
                Check back once coursework assignments and exam results are uploaded.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Marks verified by Department Examination Board</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
