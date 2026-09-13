'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Send, Wrench, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AuditAnomalyItem, ResolutionPayload } from '@/types/data-audit';
import { toast } from 'sonner';

interface DataAuditResolutionModalProps {
  anomaly: AuditAnomalyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (anomalyId: string, payload: ResolutionPayload) => Promise<void> | void;
}

export function DataAuditResolutionModal({
  anomaly,
  isOpen,
  onClose,
  onResolve,
}: DataAuditResolutionModalProps) {
  const [action, setAction] = useState<ResolutionPayload['action']>('NOTIFY_LECTURER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (anomaly) {
      if (anomaly.anomalyType === 'MISSING_MARKS') setAction('NOTIFY_LECTURER');
      else if (anomaly.anomalyType === 'INCOMPLETE_ENROLLMENT') setAction('REPAIR_ENROLLMENT');
      else if (anomaly.anomalyType === 'ORPHANED_RECORD') setAction('PURGE_RECORD');
      else setAction('NOTIFY_LECTURER');
      setNotes('');
    }
  }, [anomaly]);

  if (!isOpen || !anomaly) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onResolve(anomaly.id, { action, notes });
      toast.success(`Resolved anomaly "${anomaly.title}"`, {
        description: `Action executed: ${action}`,
      });
      onClose();
    } catch (error) {
      toast.error('Failed to resolve anomaly');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Resolve Data Anomaly
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute automated data repair or notify entity owners
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anomaly Details Card */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                {anomaly.anomalyType}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  anomaly.severity === 'HIGH'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {anomaly.severity} SEVERITY
              </span>
            </div>

            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {anomaly.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {anomaly.description}
            </p>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Affected Entity: <strong className="text-slate-700 dark:text-slate-200">{anomaly.affectedName}</strong>
            </div>
          </div>

          {/* Action Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Resolution Strategy
            </label>

            <div className="space-y-2.5">
              {/* NOTIFY_LECTURER */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'NOTIFY_LECTURER'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="action"
                    value="NOTIFY_LECTURER"
                    checked={action === 'NOTIFY_LECTURER'}
                    onChange={() => setAction('NOTIFY_LECTURER')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Notify Responsible Lecturer / Dept Head</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dispatches urgent notification email and system alert to staff member.
                    </span>
                  </div>
                </div>
                <Send className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              </label>

              {/* REPAIR_ENROLLMENT */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'REPAIR_ENROLLMENT'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="action"
                    value="REPAIR_ENROLLMENT"
                    checked={action === 'REPAIR_ENROLLMENT'}
                    onChange={() => setAction('REPAIR_ENROLLMENT')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Repair & Sync Enrollment State</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Automatically fixes missing module mapping or updates student record.
                    </span>
                  </div>
                </div>
                <Wrench className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </label>

              {/* PURGE_RECORD */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'PURGE_RECORD'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="action"
                    value="PURGE_RECORD"
                    checked={action === 'PURGE_RECORD'}
                    onChange={() => setAction('PURGE_RECORD')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold block font-sans">Purge Orphaned Record</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Permanently cleans invalid orphaned record from system database.
                    </span>
                  </div>
                </div>
                <Trash2 className="w-4 h-4 text-rose-500 flex-shrink-0" />
              </label>

              {/* DISMISS */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'DISMISS'
                    ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="action"
                    value="DISMISS"
                    checked={action === 'DISMISS'}
                    onChange={() => setAction('DISMISS')}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Dismiss Anomaly Warning</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mark as false positive without making database alterations.
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Admin Resolution Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Add internal audit trail note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
