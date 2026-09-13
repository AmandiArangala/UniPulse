/**
 * UniPulse System Data Audit Data Types
 * Phase 3: Frontend Portals - Day 15 (Administrator Portal)
 */

export type AnomalyType = 'MISSING_MARKS' | 'INCOMPLETE_ENROLLMENT' | 'ORPHANED_RECORD' | 'UNASSIGNED_MODULE';
export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type AnomalyStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';

export interface AuditAnomalyItem {
  id: string;
  title: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  entityType: string;
  entityId: string;
  affectedName: string;
  departmentName?: string;
  description: string;
  recommendedAction: string;
  status: AnomalyStatus;
  detectedAt: string;
  resolvedAt?: string;
}

export interface DataAuditSummary {
  totalAnomalies: number;
  missingMarksCount: number;
  incompleteEnrollmentsCount: number;
  orphanedRecordsCount: number;
  unassignedModulesCount: number;
  dataIntegrityScore: number; // 0 - 100%
  recentAnomalies: AuditAnomalyItem[];
}

export interface ResolutionPayload {
  action: 'NOTIFY_LECTURER' | 'REPAIR_ENROLLMENT' | 'PURGE_RECORD' | 'DISMISS';
  notes?: string;
}

export interface DataAuditFilter {
  searchQuery?: string;
  anomalyType?: AnomalyType | 'ALL';
  severity?: AnomalySeverity | 'ALL';
  status?: AnomalyStatus | 'ALL';
}
