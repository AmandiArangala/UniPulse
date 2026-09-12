'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Terminal, ShieldAlert, Sparkles } from 'lucide-react';
import { AuditLogItem, AuditLogSeverity } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { getAuditLogs } from '@/lib/admin-service';
import { AuditLogsViewer } from '@/components/admin/AuditLogsViewer';
import { toast } from 'sonner';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<AuditLogSeverity | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.ipAddress.includes(q) ||
          l.resource.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== 'ALL') {
      result = result.filter((l) => l.severity === severityFilter);
    }

    if (roleFilter !== 'ALL') {
      result = result.filter((l) => l.actorRole === roleFilter);
    }

    return result;
  }, [logs, searchQuery, severityFilter, roleFilter]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              System Admin Portal
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300 font-medium">Security & Action Audit Logs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Institutional System Audit Trail
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Consolidated security audit logs, user action history, IP address traces, and system access event inspection.
          </p>
        </div>
      </div>

      {/* Main Audit Viewer */}
      {loading ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading security audit logs...
          </div>
        </div>
      ) : (
        <AuditLogsViewer
          logs={filteredLogs}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          severityFilter={severityFilter}
          onSeverityFilterChange={setSeverityFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      )}
    </div>
  );
}
