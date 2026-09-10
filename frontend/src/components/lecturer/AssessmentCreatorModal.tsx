'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sliders,
  Check,
  Calendar,
  AlertCircle,
  Tag,
  BookOpen,
} from 'lucide-react';
import { AssessmentAuthoringItem, AssessmentTopicTag } from '@/types/lecturer';
import { AssessmentType } from '@/types/student';

interface AssessmentCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: Partial<AssessmentAuthoringItem>) => void;
  initialData?: AssessmentAuthoringItem | null;
  moduleId: string;
  semesterId?: string;
  currentTotalWeight?: number;
}

const assessmentTypes: { label: string; value: AssessmentType; defaultWeight: number }[] = [
  { label: 'Assignment / Homework', value: 'ASSIGNMENT', defaultWeight: 15 },
  { label: 'Midterm Examination', value: 'MIDTERM_EXAM', defaultWeight: 25 },
  { label: 'Final Examination', value: 'FINAL_EXAM', defaultWeight: 60 },
  { label: 'Project / Case Study', value: 'PROJECT', defaultWeight: 20 },
  { label: 'Quiz / Lab Test', value: 'QUIZ', defaultWeight: 10 },
  { label: 'Lab Practical', value: 'LAB_PRACTICAL', defaultWeight: 15 },
  { label: 'Presentation / Viva', value: 'PRESENTATION', defaultWeight: 10 },
];

export function AssessmentCreatorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  moduleId,
  semesterId = 'sem-2026-s1',
  currentTotalWeight = 0,
}: AssessmentCreatorModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AssessmentType>('ASSIGNMENT');
  const [weightPercentage, setWeightPercentage] = useState<number>(15);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<AssessmentTopicTag[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setWeightPercentage(initialData.weightPercentage);
      setMaxScore(initialData.maxScore);
      setDueDate(initialData.dueDate || '');
      setDescription(initialData.description || '');
      setTopics(initialData.topics || []);
    } else {
      setTitle('');
      setType('ASSIGNMENT');
      setWeightPercentage(15);
      setMaxScore(100);
      setDueDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setTopics([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    const newTopic: AssessmentTopicTag = {
      id: `top-${Date.now()}`,
      topicName: topicInput.trim(),
    };
    setTopics([...topics, newTopic]);
    setTopicInput('');
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData?.id,
      moduleId,
      semesterId,
      title: title.trim(),
      type,
      weightPercentage: Number(weightPercentage),
      maxScore: Number(maxScore),
      dueDate,
      description,
      topics,
      isPublished: initialData?.isPublished || false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialData ? 'Edit Assessment Component' : 'Author New Assessment'}
              </h3>
              <p className="text-xs text-slate-500">Configure evaluation criteria & weight allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 my-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Assessment Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assessment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Assignment 1: ER Diagrams & Normalization"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Type & Maximum Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assessment Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssessmentType)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                {assessmentTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Maximum Score (Points)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Weight Percentage Slider & Input */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Weight Allocation Percentage (%)</span>
              </label>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-indigo-900/60 px-3 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                {weightPercentage}%
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="100"
              value={weightPercentage}
              onChange={(e) => setWeightPercentage(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-indigo-200 dark:bg-indigo-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Min: 1%</span>
              <span>Max: 100%</span>
            </div>
          </div>

          {/* Due Date & Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Submission Due Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Topic Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Diagnostic Topic Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add topic (e.g., Relational Algebra)..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {topics.map((t) => (
                <span
                  key={t.id}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" /> {t.topicName}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(t.id)}
                    className="hover:text-rose-600 transition-colors ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Instructions / Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief assessment guidelines for enrolled students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Assessment' : 'Create & Add Assessment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
