'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  User,
  Terminal,
  X,
  FileCode,
  Globe,
  Lock,
} from 'lucide-react';
import { AuditLogItem, AuditLogSeverity } from '@/types/admin';
import { UserRole } from '@/types/auth';

interface AuditLogsViewerProps {
  logs: AuditLogItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  severityFilter: AuditLogSeverity | 'ALL';
  onSeverityFilterChange: (s: AuditLogSeverity | 'ALL') => void;
  roleFilter: UserRole | 'ALL';
  onRoleFilterChange: (r: UserRole | 'ALL') => void;
}

export function AuditLogsViewer({
  logs,
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityFilterChange,
  roleFilter,
  onRoleFilterChange,
}: AuditLogsViewerProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const hasActiveFilters = searchQuery !== '' || severityFilter !== 'ALL' || roleFilter !== 'ALL';

  const resetFilters = () => {
    onSearchChange('');
    onSeverityFilterChange('ALL');
    onRoleFilterChange('ALL');
  };

  const getSeverityBadge = (severity: AuditLogSeverity) => {
    switch (severity) {
      case 'INFO':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
            <Info className="w-3 h-3" />
            INFO
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            WARNING
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            CRITICAL
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search audit action, actor name, resource, or IP address..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => onSeverityFilterChange(e.target.value as AuditLogSeverity | 'ALL')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Event Severities</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical Alert</option>
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as UserRole | 'ALL')}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Actor Roles</option>
            <option value="ADMIN">System Admin</option>
            <option value="ADVISOR">Advisor</option>
            <option value="LECTURER">Lecturer</option>
            <option value="STUDENT">Student</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Logs Feed List */}
      <div className="space-y-3 pt-2">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getSeverityBadge(log.severity)}
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {log.action}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">&bull; {log.resource}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {log.ipAddress}
                  </span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {log.details}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  Actor: <strong className="text-slate-800 dark:text-slate-200">{log.actorName}</strong> ({log.actorEmail} &bull; {log.actorRole})
                </span>

                <button
                  onClick={() => setSelectedLog(log)}
                  className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <FileCode className="w-3 h-3" />
                  <span>Inspect JSON</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No audit log entries matched your filter criteria.
          </div>
        )}
      </div>

      {/* JSON Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4 font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Security Audit Event Payload</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto max-h-80 text-emerald-400 text-[11px] leading-relaxed">
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Close Payload Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
