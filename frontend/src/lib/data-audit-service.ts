import { apiClient } from './axios';
import {
  AuditAnomalyItem,
  DataAuditSummary,
  ResolutionPayload,
  DataAuditFilter,
} from '@/types/data-audit';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// Realistic Mock Fallback Data (Zero UI Downtime & Offline Preview)
// ============================================================================

export const mockAuditAnomalies: AuditAnomalyItem[] = [
  {
    id: 'anom-101',
    title: 'Unsubmitted Midterm Marks for CS-301',
    anomalyType: 'MISSING_MARKS',
    severity: 'HIGH',
    entityType: 'Assessment',
    entityId: 'assg-301',
    affectedName: 'CS-301 Data Structures Midterm',
    departmentName: 'Computer Science',
    description: '48 student mark sheets are pending lecturer approval past deadline (overdue by 4 days).',
    recommendedAction: 'Notify lecturer Prof. Marcus Brody to upload final score CSV.',
    status: 'OPEN',
    detectedAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'anom-102',
    title: 'Orphaned Module Enrollment Record',
    anomalyType: 'ORPHANED_RECORD',
    severity: 'MEDIUM',
    entityType: 'ModuleEnrollment',
    entityId: 'enr-8901',
    affectedName: 'Student #stu-409 (Withdrawn)',
    departmentName: 'Electrical Engineering',
    description: 'Active enrollment record exists for student Julian Thorne who was suspended/withdrawn.',
    recommendedAction: 'Purge orphaned record or reassign to general elective catalog.',
    status: 'OPEN',
    detectedAt: '2026-09-11T09:15:00Z',
  },
  {
    id: 'anom-103',
    title: 'Incomplete Student Degree Declaration',
    anomalyType: 'INCOMPLETE_ENROLLMENT',
    severity: 'HIGH',
    entityType: 'Student',
    entityId: 'stu-104',
    affectedName: 'Sophia Martinez (ID #2024-CS-09)',
    departmentName: 'Computer Science',
    description: 'Student registered in Fall 2026 term without mandatory Core CS-101 module requirement.',
    recommendedAction: 'Repair enrollment state by registering missing prerequisite module.',
    status: 'OPEN',
    detectedAt: '2026-09-12T06:00:00Z',
  },
  {
    id: 'anom-104',
    title: 'Unassigned Module Lecturer Coordinator',
    anomalyType: 'UNASSIGNED_MODULE',
    severity: 'LOW',
    entityType: 'Module',
    entityId: 'mod-ee-204',
    affectedName: 'EE-204 Circuit Analysis II',
    departmentName: 'Electrical Engineering',
    description: 'Course module active for Fall 2026 term has no primary lecturer assigned.',
    recommendedAction: 'Assign module lecturer coordinator via Academic Catalog Manager.',
    status: 'OPEN',
    detectedAt: '2026-09-08T11:20:00Z',
  },
  {
    id: 'anom-105',
    title: 'Missing Final Grade Submission for MATH-201',
    anomalyType: 'MISSING_MARKS',
    severity: 'HIGH',
    entityType: 'Assessment',
    entityId: 'assg-math-201',
    affectedName: 'MATH-201 Linear Algebra Final Exam',
    departmentName: 'Mathematics',
    description: '32 student scores have not been published by Dr. Sarah Jenkins.',
    recommendedAction: 'Send automated email reminder to department head and lecturer.',
    status: 'OPEN',
    detectedAt: '2026-09-09T16:45:00Z',
  },
];

// ============================================================================
// Service Layer Exported Methods
// ============================================================================

export async function getAuditSummary(): Promise<DataAuditSummary> {
  try {
    const res = await apiClient.get<BackendApiResponse<DataAuditSummary>>('/admin/data-audit/summary');
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Data Audit Summary.', error);
  }

  const openList = mockAuditAnomalies.filter(
    (a) => a.status !== 'RESOLVED' && a.status !== 'DISMISSED'
  );

  const missing = openList.filter((a) => a.anomalyType === 'MISSING_MARKS').length;
  const incomplete = openList.filter((a) => a.anomalyType === 'INCOMPLETE_ENROLLMENT').length;
  const orphaned = openList.filter((a) => a.anomalyType === 'ORPHANED_RECORD').length;
  const unassigned = openList.filter((a) => a.anomalyType === 'UNASSIGNED_MODULE').length;

  const total = openList.length;
  const integrityScore = Math.max(0, Math.min(100, 100 - total * 3.5));

  return {
    totalAnomalies: total,
    missingMarksCount: missing,
    incompleteEnrollmentsCount: incomplete,
    orphanedRecordsCount: orphaned,
    unassignedModulesCount: unassigned,
    dataIntegrityScore: Math.round(integrityScore * 10) / 10,
    recentAnomalies: openList.slice(0, 5),
  };
}

export async function getAuditAnomalies(filter?: DataAuditFilter): Promise<AuditAnomalyItem[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<AuditAnomalyItem[]>>('/admin/data-audit/anomalies', {
      params: {
        type: filter?.anomalyType !== 'ALL' ? filter?.anomalyType : undefined,
        severity: filter?.severity !== 'ALL' ? filter?.severity : undefined,
        search: filter?.searchQuery,
      },
    });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Audit Anomalies.', error);
  }

  let result = [...mockAuditAnomalies];

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.affectedName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.departmentName && a.departmentName.toLowerCase().includes(q))
    );
  }

  if (filter?.anomalyType && filter.anomalyType !== 'ALL') {
    result = result.filter((a) => a.anomalyType === filter.anomalyType);
  }

  if (filter?.severity && filter.severity !== 'ALL') {
    result = result.filter((a) => a.severity === filter.severity);
  }

  if (filter?.status && filter.status !== 'ALL') {
    result = result.filter((a) => a.status === filter.status);
  }

  return result;
}

export async function resolveAnomaly(
  anomalyId: string,
  payload: ResolutionPayload
): Promise<AuditAnomalyItem> {
  try {
    const res = await apiClient.post<BackendApiResponse<AuditAnomalyItem>>(
      `/admin/data-audit/anomalies/${anomalyId}/resolve`,
      payload
    );
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable. Resolving mock anomaly ${anomalyId}.`, error);
  }

  const item = mockAuditAnomalies.find((a) => a.id === anomalyId);
  if (item) {
    if (payload.action === 'DISMISS') {
      item.status = 'DISMISSED';
    } else {
      item.status = 'RESOLVED';
    }
    item.resolvedAt = new Date().toISOString();
    if (payload.notes) {
      item.description += ` | Resolution Note: ${payload.notes}`;
    }
    return item;
  }

  throw new Error(`Audit Anomaly with ID ${anomalyId} not found.`);
}
