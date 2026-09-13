'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import {
  AuditAnomalyItem,
  DataAuditSummary,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
  ResolutionPayload,
} from '@/types/data-audit';
import {
  getAuditSummary,
  getAuditAnomalies,
  resolveAnomaly,
} from '@/lib/data-audit-service';
import { DataAuditSummaryBar } from '@/components/admin/DataAuditSummaryBar';
import { DataAuditAnomaliesTable } from '@/components/admin/DataAuditAnomaliesTable';
import { DataAuditResolutionModal } from '@/components/admin/DataAuditResolutionModal';
import { toast } from 'sonner';

export default function AdminDataAuditPage() {
  const [summary, setSummary] = useState<DataAuditSummary | null>(null);
  const [anomalies, setAnomalies] = useState<AuditAnomalyItem[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AnomalyType | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | 'ALL'>('ALL');

  // Modal Resolution State
  const [selectedAnomaly, setSelectedAnomaly] = useState<AuditAnomalyItem | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

  const loadSummaryData = async () => {
    try {
      setIsLoadingSummary(true);
      const data = await getAuditSummary();
      setSummary(data);
    } catch (error) {
      toast.error('Failed to load system data audit metrics');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadAnomaliesData = async () => {
    try {
      setIsLoadingAnomalies(true);
      const list = await getAuditAnomalies({
        searchQuery,
        anomalyType: typeFilter,
        severity: severityFilter,
        status: statusFilter,
      });
      setAnomalies(list);
    } catch (error) {
      toast.error('Failed to load audit anomalies listing');
    } finally {
      setIsLoadingAnomalies(false);
    }
  };

  useEffect(() => {
    loadSummaryData();
  }, []);

  useEffect(() => {
    loadAnomaliesData();
  }, [searchQuery, typeFilter, severityFilter, statusFilter]);

  const handleRefresh = () => {
    loadSummaryData();
    loadAnomaliesData();
    toast.info('Refreshed data audit metrics and anomalies');
  };

  const handleOpenResolveModal = (anomaly: AuditAnomalyItem) => {
    setSelectedAnomaly(anomaly);
    setIsResolutionModalOpen(true);
  };

  const handleExecuteResolution = async (anomalyId: string, payload: ResolutionPayload) => {
    await resolveAnomaly(anomalyId, payload);
    loadSummaryData();
    loadAnomaliesData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Integrity & Compliance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Data Audit View
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit missing assessment marks, incomplete student degree enrollments, and orphaned database references.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-indigo-500" />
          <span>Run Fresh Audit Scan</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <DataAuditSummaryBar summary={summary} isLoading={isLoadingSummary} />

      {/* Anomalies Table */}
      <DataAuditAnomaliesTable
        anomalies={anomalies}
        isLoading={isLoadingAnomalies}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSelectAnomalyToResolve={handleOpenResolveModal}
      />

      {/* Resolution Modal */}
      <DataAuditResolutionModal
        anomaly={selectedAnomaly}
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
        onResolve={handleExecuteResolution}
      />
    </div>
  );
}
