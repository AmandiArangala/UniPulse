'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Archive,
  Star,
  X,
  CalendarDays,
} from 'lucide-react';
import { AcademicTerm, TermStatus } from '@/types/catalog';
import { getTerms, createTerm, setCurrentTerm } from '@/lib/catalog-service';
import { toast } from 'sonner';

export function TermManager() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-20');
  const [status, setStatus] = useState<TermStatus>('ACTIVE');
  const [isCurrent, setIsCurrent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const list = await getTerms();
      setTerms(list);
    } catch (error) {
      toast.error('Failed to load academic terms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setCode('2027-SEM-1');
    setName('Fall Semester 2027/2028');
    setAcademicYear('2027/2028');
    setStartDate('2027-09-01');
    setEndDate('2027-12-20');
    setStatus('UPCOMING');
    setIsCurrent(false);
    setIsModalOpen(true);
  };

  const handleSetCurrent = async (term: AcademicTerm) => {
    if (term.isCurrent) return;
    if (!confirm(`Set "${term.name}" (${term.code}) as the active institutional academic term?`)) return;

    try {
      await setCurrentTerm(term.id);
      toast.success(`Active term set to ${term.name}`);
      loadData();
    } catch (error) {
      toast.error('Failed to set active term');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !academicYear.trim()) {
      toast.error('Code, Name, and Academic Year are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createTerm({
        code: code.trim(),
        name: name.trim(),
        academicYear: academicYear.trim(),
        startDate,
        endDate,
        status,
        isCurrent,
      });
      toast.success(`Academic term ${name} added successfully`);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to add term');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (t: AcademicTerm) => {
    if (t.isCurrent) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 animate-pulse">
          <Star className="w-3.5 h-3.5 mr-1 fill-white" />
          ACTIVE CURRENT TERM
        </span>
      );
    }
    if (t.status === 'UPCOMING') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock className="w-3.5 h-3.5 mr-1" />
          UPCOMING TERM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <Archive className="w-3.5 h-3.5 mr-1" />
        ARCHIVED TERM
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-900 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            <CalendarDays className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Academic Terms & Semesters</h3>
            <p className="text-xs text-indigo-200">
              Configure session start/end dates and trigger active term switching across UniPulse.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-extrabold text-sm hover:bg-indigo-50 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Academic Term</span>
        </button>
      </div>

      {/* Terms Table List */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading academic terms...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {terms.map((term) => (
              <div
                key={term.id}
                className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  term.isCurrent
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-indigo-600 font-mono font-bold text-xs">
                      {term.code}
                    </span>
                    {getStatusBadge(term)}
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {term.name}
                  </h4>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>Academic Year: <strong className="text-slate-700 dark:text-slate-300">{term.academicYear}</strong></span>
                    <span>•</span>
                    <span>Range: <strong className="text-slate-700 dark:text-slate-300">{term.startDate}</strong> to <strong className="text-slate-700 dark:text-slate-300">{term.endDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {!term.isCurrent && (
                    <button
                      onClick={() => handleSetCurrent(term)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 font-bold text-xs transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Set Active Term</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Term Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Academic Term</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Term Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-SEM-1"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026/2027"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Term Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fall Semester 2026/2027"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TermStatus)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="isCurrent" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Set immediately as current active institutional term
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md"
                >
                  {isSubmitting ? 'Creating...' : 'Create Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
