'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sliders,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit,
  Send,
  Calendar,
  Tag,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AssignedModule, AssessmentAuthoringItem } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { WeightAllocationBar } from '@/components/lecturer/WeightAllocationBar';
import { AssessmentCreatorModal } from '@/components/lecturer/AssessmentCreatorModal';
import { toast } from 'sonner';

export default function AssessmentAuthoringPage() {
  const searchParams = useSearchParams();
  const preselectedModuleId = searchParams.get('module');

  const [modules, setModules] = useState<AssignedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [assessments, setAssessments] = useState<AssessmentAuthoringItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentAuthoringItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

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
      loadAssessments(selectedModuleId);
    }
  }, [selectedModuleId]);

  const loadAssessments = async (modId: string) => {
    try {
      const data = await lecturerService.getModuleAssessments(modId);
      setAssessments(data);
    } catch {
      toast.error('Failed to load assessments');
    }
  };

  const selectedModule = useMemo(() => {
    return modules.find((m) => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const totalWeight = useMemo(() => {
    return assessments.reduce((acc, a) => acc + (a.weightPercentage || 0), 0);
  }, [assessments]);

  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const handleSaveAssessment = async (assessmentData: Partial<AssessmentAuthoringItem>) => {
    try {
      if (assessmentData.id) {
        // Edit existing
        const updated = await lecturerService.updateAssessment(assessmentData.id, assessmentData);
        setAssessments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('Assessment updated successfully');
      } else {
        // Create new
        const created = await lecturerService.createAssessment(assessmentData);
        setAssessments((prev) => [...prev, created]);
        toast.success('New assessment component added');
      }
    } catch {
      toast.error('Failed to save assessment');
    }
  };

  const handleDeleteAssessment = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await lecturerService.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      toast.success('Assessment deleted');
    } catch {
      toast.error('Failed to delete assessment');
    }
  };

  const handlePublishStructure = async () => {
    if (!isWeightValid) {
      toast.error('Cannot publish assessment structure', {
        description: `Total weight allocation must equal exactly 100%. Current total: ${totalWeight}%.`,
      });
      return;
    }

    setIsPublishing(true);
    try {
      await lecturerService.publishAssessmentStructure(selectedModuleId);
      setAssessments((prev) => prev.map((a) => ({ ...a, isPublished: true })));
      toast.success('Assessment structure published to student portal!', {
        description: 'Students can now view assessment weight breakdowns in their dashboards.',
      });
    } catch {
      toast.error('Failed to publish assessment structure');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase mb-1">
            <Sliders className="w-4 h-4" />
            <span>Lecturer Portal • Grading Scheme</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assessment Creator & Weight Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure assessment components, dynamic weight allocations, and 100% total validation checks.
          </p>
        </div>

        {/* Module Selector & Create Button */}
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

          <button
            onClick={() => {
              setEditingAssessment(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Author New Assessment</span>
          </button>
        </div>
      </div>

      {/* Dynamic Weight Allocation Monitor */}
      <WeightAllocationBar assessments={assessments} />

      {/* Warning banner if weight != 100% */}
      {!isWeightValid && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Validation Warning: Total weight is {totalWeight}%</span>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                The total combined weight of all assessments must equal 100% before publishing to students.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assessments List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Assessment Structure ({selectedModule?.moduleCode})</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {assessments.length} Components
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous Assessment (CA) & Written Exam (WE) component list
            </p>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublishStructure}
            disabled={!isWeightValid || isPublishing}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isWeightValid
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Structure'}</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Title & Topics</th>
                <th className="py-3.5 px-4">Weight %</th>
                <th className="py-3.5 px-4">Max Score</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Publish Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                      {item.type}
                    </span>
                  </td>

                  {/* Title & Topics */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    {item.topics && item.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {item.topics.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 text-[9px] rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-indigo-500" /> {t.topicName}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Weight Percentage */}
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {item.weightPercentage}%
                    </span>
                  </td>

                  {/* Max Score */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.maxScore} pts
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4">
                    <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.dueDate || 'N/A'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {item.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Draft
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingAssessment(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Assessment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assessments.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No assessment components created for this module yet. Click "Author New Assessment" to add one.
            </div>
          )}
        </div>
      </div>

      {/* Assessment Authoring Modal */}
      <AssessmentCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAssessment}
        initialData={editingAssessment}
        moduleId={selectedModuleId}
        currentTotalWeight={totalWeight}
      />
    </div>
  );
}
