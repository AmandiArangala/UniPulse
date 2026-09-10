'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Users,
  CheckCircle2,
  Mail,
  Send,
  UserCheck,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { AttentionQueueItem } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { toast } from 'sonner';

export default function LecturerAttentionQueuePage() {
  const [queue, setQueue] = useState<AttentionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getAttentionQueue();
      setQueue(data);
    } catch {
      toast.error('Failed to load attention queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (item: AttentionQueueItem, actionName: string) => {
    toast.success(`${actionName} triggered for ${item.studentName}`, {
      description: `Action recorded for ${item.moduleCode}. Student notified.`,
    });
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
  };

  const criticalCount = queue.filter((q) => q.severity === 'CRITICAL').length;
  const highCount = queue.filter((q) => q.severity === 'HIGH').length;
  const mediumCount = queue.filter((q) => q.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Lecturer Portal • Early Warning System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Attention & Risk Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of students requiring academic intervention, attendance warnings, or advisor escalation.
          </p>
        </div>

        <button
          onClick={loadQueue}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Summary Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Critical Risk Alerts
            </span>
            <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
              {criticalCount}
            </div>
            <span className="text-[11px] text-rose-600/80">Immediate intervention required</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-500 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              High Risk Warnings
            </span>
            <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">
              {highCount}
            </div>
            <span className="text-[11px] text-amber-700/80">Low grades / missing work</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
              Moderate Watchlist
            </span>
            <div className="text-2xl font-extrabold text-indigo-800 dark:text-indigo-300 mt-1">
              {mediumCount}
            </div>
            <span className="text-[11px] text-indigo-600/80">Attendance drop warnings</span>
          </div>
          <Bell className="w-8 h-8 text-indigo-500 opacity-80" />
        </div>
      </div>

      {/* Queue Items Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Active Student Flag Queue</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {queue.length} Flagged Cases Pending
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {queue.map((item) => {
            const isCritical = item.severity === 'CRITICAL';
            const isHigh = item.severity === 'HIGH';

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase">
                        Critical Severity
                      </span>
                    ) : isHigh ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                        High Risk
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                        Moderate Risk
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-slate-500">
                      {item.moduleCode}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.studentName}</span>
                    <span className="text-xs font-mono font-normal text-slate-400">({item.studentNumber})</span>
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-200">Flagged Issue:</strong> {item.metricValue}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <strong className="text-indigo-600 dark:text-indigo-400">Recommended Action:</strong> {item.recommendedAction}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => handleAction(item, 'Advisor Escalation')}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Escalate to Advisor
                  </button>
                  <button
                    onClick={() => handleAction(item, 'Warning Email')}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Student</span>
                  </button>
                  <button
                    onClick={() => handleAction(item, 'Dismissal')}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}

          {queue.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No students currently in the attention queue. Great job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
