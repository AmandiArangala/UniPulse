'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  User,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import {
  AssignedStudent,
  InterventionType,
  InterventionPriority,
  CreateInterventionPayload,
  AcademicInterventionItem,
} from '@/types/advisor';
import { createIntervention } from '@/lib/advisor-service';

interface AcademicInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudent?: AssignedStudent | null;
  assignedStudents?: AssignedStudent[];
  onSuccess?: (newIntervention: AcademicInterventionItem) => void;
}

const INTERVENTION_TYPES: { type: InterventionType; label: string; description: string }[] = [
  {
    type: 'ACADEMIC_COUNSELING',
    label: 'Academic Counseling Session',
    description: 'Direct 1-on-1 counseling to address study habits, coursework challenges, or midterm failures.',
  },
  {
    type: 'TUTORING_REFERRAL',
    label: 'Peer Tutoring Referral',
    description: 'Refer student to subject-matter peer tutoring center for targeted module assistance.',
  },
  {
    type: 'ATTENDANCE_WARNING',
    label: 'Formal Attendance Warning',
    description: 'Issue official attendance warning for dropping below institutional 75% threshold.',
  },
  {
    type: 'PROBATION_NOTICE',
    label: 'Academic Probation Notice',
    description: 'Formal notification regarding probation status and mandatory grade recovery plan.',
  },
  {
    type: 'MENTAL_HEALTH_REFERRAL',
    label: 'Student Wellbeing Referral',
    description: 'Connect student with university health services or personal wellness advisors.',
  },
  {
    type: 'STUDY_PLAN',
    label: 'Custom Academic Study Plan',
    description: 'Draft tailored course load or degree completion timeline.',
  },
  {
    type: 'CREDIT_ADJUSTMENT',
    label: 'Course Credit Load Adjustment',
    description: 'Recommend dropping or swapping elective modules to stabilize academic standing.',
  },
];

const MODULE_OPTIONS = [
  { id: '', title: '-- No Specific Module (General Academic Support) --' },
  { id: 'mod-301', title: 'CS-301 Database Systems & SQL Architectures' },
  { id: 'mod-201', title: 'CS-201 Object-Oriented Design & Patterns' },
  { id: 'mod-305', title: 'CS-305 Algorithms & Data Structures II' },
  { id: 'mod-101', title: 'CS-101 Programming Fundamentals in C++' },
];

export function AcademicInterventionModal({
  isOpen,
  onClose,
  preselectedStudent,
  assignedStudents = [],
  onSuccess,
}: AcademicInterventionModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [interventionType, setInterventionType] = useState<InterventionType>('ACADEMIC_COUNSELING');
  const [priority, setPriority] = useState<InterventionPriority>('MEDIUM');
  const [moduleId, setModuleId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedStudent) {
        setSelectedStudentId(preselectedStudent.id);
      } else if (assignedStudents.length > 0) {
        setSelectedStudentId(assignedStudents[0].id);
      }
      setInterventionType('ACADEMIC_COUNSELING');
      setPriority('MEDIUM');
      setModuleId('');
      setReason('');
      setFollowUpDate('');
      setNotes('');
      setErrorMessage(null);
    }
  }, [isOpen, preselectedStudent, assignedStudents]);

  if (!isOpen) return null;

  const currentStudent =
    preselectedStudent || assignedStudents.find((s) => s.id === selectedStudentId) || assignedStudents[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId && !currentStudent) {
      setErrorMessage('Please select a student for this intervention case.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please provide a primary reason or trigger for the intervention.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: CreateInterventionPayload = {
      studentId: currentStudent ? currentStudent.id : selectedStudentId,
      moduleId: moduleId || undefined,
      interventionType,
      priority,
      reason: reason.trim(),
      followUpDate: followUpDate || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const created = await createIntervention(payload);
      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to log intervention:', err);
      setErrorMessage(err.message || 'An error occurred while logging the intervention case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative border-b border-indigo-900/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Academic Support Case Management
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            Log New Academic Intervention
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
            Record targeted academic intervention actions, schedule follow-ups, and log early warning support notes.
          </p>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Student Selector Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Target Student
            </label>

            {preselectedStudent ? (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {preselectedStudent.avatarUrl ? (
                  <img
                    src={preselectedStudent.avatarUrl}
                    alt={preselectedStudent.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {preselectedStudent.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {preselectedStudent.fullName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {preselectedStudent.studentNumber} &bull; {preselectedStudent.programCode} &bull; GPA: {preselectedStudent.gpa.toFixed(2)}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Pre-selected
                </span>
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {assignedStudents.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.fullName} ({stu.studentNumber}) - {stu.programCode} (GPA: {stu.gpa.toFixed(2)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Intervention Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Intervention Category & Type *
            </label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value as InterventionType)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {INTERVENTION_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {INTERVENTION_TYPES.find((t) => t.type === interventionType)?.description}
            </p>
          </div>

          {/* Priority Level Radio Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Case Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as InterventionPriority[]).map((p) => {
                const isSelected = priority === p;
                let styleClasses = 'bg-slate-50 border-slate-200 text-slate-700';
                if (p === 'LOW') {
                  styleClasses = isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                } else if (p === 'MEDIUM') {
                  styleClasses = isSelected
                    ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                } else if (p === 'HIGH') {
                  styleClasses = isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                } else if (p === 'CRITICAL') {
                  styleClasses = isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-extrabold animate-pulse'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 px-3 rounded-xl border text-xs text-center transition-all flex items-center justify-center gap-1.5 ${styleClasses}`}
                  >
                    {p === 'CRITICAL' && <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Associated Module & Follow-up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Associated Module (Optional)
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Target Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Primary Reason / Trigger Description *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Scored 42% on midterm assessment and missed 4 consecutive practical lab sessions..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Additional Action Notes Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Initial Action Notes & Recommendations (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scheduled 1-on-1 counseling session on Sept 14. Recommended peer tutoring..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Form Submit Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging Case...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Support Intervention</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
