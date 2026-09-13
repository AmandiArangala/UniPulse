'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileWarning,
  UserX,
  Database,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AuditAnomalyItem, AnomalyType, AnomalySeverity, AnomalyStatus } from '@/types/data-audit';

interface DataAuditAnomaliesTableProps {
  anomalies: AuditAnomalyItem[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: AnomalyType | 'ALL';
  onTypeFilterChange: (type: AnomalyType | 'ALL') => void;
  severityFilter: AnomalySeverity | 'ALL';
  onSeverityFilterChange: (severity: AnomalySeverity | 'ALL') => void;
  statusFilter: AnomalyStatus | 'ALL';
  onStatusFilterChange: (status: AnomalyStatus | 'ALL') => void;
  onSelectAnomalyToResolve: (anomaly: AuditAnomalyItem) => void;
}

export function DataAuditAnomaliesTable({
  anomalies,
  isLoading,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  severityFilter,
  onSeverityFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectAnomalyToResolve,
}: DataAuditAnomaliesTableProps) {
  const getAnomalyIcon = (type: AnomalyType) => {
    switch (type) {
      case 'MISSING_MARKS':
        return <FileWarning className="w-4 h-4 text-rose-500" />;
      case 'INCOMPLETE_ENROLLMENT':
        return <UserX className="w-4 h-4 text-indigo-500" />;
      case 'ORPHANED_RECORD':
        return <Database className="w-4 h-4 text-purple-500" />;
      case 'UNASSIGNED_MODULE':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getSeverityBadge = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Top Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search anomalies by entity name, title or details..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Anomaly Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as AnomalyType | 'ALL')}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Anomaly Types</option>
            <option value="MISSING_MARKS">Missing Marks</option>
            <option value="INCOMPLETE_ENROLLMENT">Incomplete Enrollment</option>
            <option value="ORPHANED_RECORD">Orphaned Record</option>
            <option value="UNASSIGNED_MODULE">Unassigned Module</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => onSeverityFilterChange(e.target.value as AnomalySeverity | 'ALL')}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as AnomalyStatus | 'ALL')}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
              <th className="py-3 px-4">Anomaly Title & Type</th>
              <th className="py-3 px-4">Affected Entity</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Description & Recommendation</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Running system data integrity check...
                </td>
              </tr>
            ) : anomalies.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No Data Anomalies Found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Your system database records match clean integrity rules.</p>
                </td>
              </tr>
            ) : (
              anomalies.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Title & Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {getAnomalyIcon(item.anomalyType)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                          {item.anomalyType}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Entity */}
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    <div className="font-semibold text-xs">{item.affectedName}</div>
                    <div className="text-[10px] text-slate-400">{item.departmentName || 'System Wide'}</div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">{getSeverityBadge(item.severity)}</td>

                  {/* Description & Recommended Action */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{item.description}</p>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block mt-1">
                      Rec: {item.recommendedAction}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {item.status === 'RESOLVED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        RESOLVED
                      </span>
                    ) : item.status === 'DISMISSED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        DISMISSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="w-3 h-3 mr-1" />
                        OPEN
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'OPEN' ? (
                      <button
                        onClick={() => onSelectAnomalyToResolve(item)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1 ml-auto cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
