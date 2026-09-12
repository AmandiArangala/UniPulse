import { apiClient } from './axios';
import {
  AdminUserItem,
  UserFilter,
  CreateUserPayload,
  UserRole,
  UserStatus,
  AuditLogItem,
  AuditLogFilter,
  SystemHealthMetrics,
} from '@/types/admin';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// ============================================================================
// Realistic Mock Fallback Data (Zero UI Downtime & Offline Preview)
// ============================================================================

export const mockAdminUsers: AdminUserItem[] = [
  {
    id: 'usr-101',
    fullName: 'Dr. Eleanor Vance',
    email: 'e.vance@unipulse.edu',
    role: 'ADVISOR',
    status: 'ACTIVE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    lastLoginAt: '2026-09-12T08:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-102',
    fullName: 'Prof. Marcus Brody',
    email: 'm.brody@unipulse.edu',
    role: 'LECTURER',
    status: 'ACTIVE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    lastLoginAt: '2026-09-11T16:45:00Z',
    createdAt: '2023-08-20T10:15:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-103',
    fullName: 'Alexander Wright',
    email: 'a.wright@unipulse.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    lastLoginAt: '2026-09-12T07:10:00Z',
    createdAt: '2024-09-01T08:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-104',
    fullName: 'Sophia Martinez',
    email: 's.martinez@unipulse.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    lastLoginAt: '2026-09-10T14:20:00Z',
    createdAt: '2024-09-01T08:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-105',
    fullName: 'System Administrator (Root)',
    email: 'admin@unipulse.edu',
    role: 'ADMIN',
    status: 'ACTIVE',
    departmentId: 'dept-it',
    departmentName: 'IT Infrastructure',
    lastLoginAt: '2026-09-12T09:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-106',
    fullName: 'Dr. Sarah Jenkins',
    email: 's.jenkins@unipulse.edu',
    role: 'LECTURER',
    status: 'INACTIVE',
    departmentId: 'dept-math',
    departmentName: 'Mathematics',
    lastLoginAt: '2026-07-20T11:00:00Z',
    createdAt: '2022-09-10T11:00:00Z',
  },
  {
    id: 'usr-107',
    fullName: 'Julian Thorne',
    email: 'j.thorne@unipulse.edu',
    role: 'STUDENT',
    status: 'SUSPENDED',
    departmentId: 'dept-ee',
    departmentName: 'Electrical Engineering',
    lastLoginAt: '2026-08-15T09:30:00Z',
    createdAt: '2023-09-01T08:00:00Z',
  },
];

export const mockAuditLogs: AuditLogItem[] = [
  {
    id: 'log-1001',
    actorId: 'usr-105',
    actorName: 'System Administrator (Root)',
    actorEmail: 'admin@unipulse.edu',
    actorRole: 'ADMIN',
    action: 'USER_ROLE_UPDATED',
    resource: 'User #usr-101 (Dr. Eleanor Vance)',
    details: 'Promoted role from LECTURER to ADVISOR for CS Department.',
    ipAddress: '192.168.1.10',
    timestamp: '2026-09-12T08:45:12Z',
    severity: 'INFO',
  },
  {
    id: 'log-1002',
    actorId: 'usr-101',
    actorName: 'Dr. Eleanor Vance',
    actorEmail: 'e.vance@unipulse.edu',
    actorRole: 'ADVISOR',
    action: 'INTERVENTION_CREATED',
    resource: 'Student #stu-101 (Alexander Wright)',
    details: 'Logged ACADEMIC_COUNSELING case for midterm failure.',
    ipAddress: '192.168.1.42',
    timestamp: '2026-09-12T08:15:30Z',
    severity: 'WARNING',
  },
  {
    id: 'log-1003',
    actorId: 'usr-105',
    actorName: 'System Administrator (Root)',
    actorEmail: 'admin@unipulse.edu',
    actorRole: 'ADMIN',
    action: 'SECURITY_ALERT',
    resource: 'Auth Endpoint /api/v1/auth/login',
    details: 'Multiple failed login attempts detected from IP 45.132.18.9.',
    ipAddress: '45.132.18.9',
    timestamp: '2026-09-11T23:10:00Z',
    severity: 'CRITICAL',
  },
  {
    id: 'log-1004',
    actorId: 'usr-102',
    actorName: 'Prof. Marcus Brody',
    actorEmail: 'm.brody@unipulse.edu',
    actorRole: 'LECTURER',
    action: 'MARKS_BATCH_SAVED',
    resource: 'Module CS-301 Assessment #assg-2',
    details: 'Published 48 student scores for Midterm Assessment.',
    ipAddress: '192.168.1.88',
    timestamp: '2026-09-11T16:50:00Z',
    severity: 'INFO',
  },
];

export const mockSystemHealth: SystemHealthMetrics = {
  cpuUsagePercent: 24.5,
  memoryUsagePercent: 48.2,
  activeConnections: 142,
  apiLatencyMs: 38,
  errorRatePercent: 0.04,
  databaseStatus: 'HEALTHY',
  redisStatus: 'HEALTHY',
  uptimeSeconds: 1248500,
  lastBackupAt: '2026-09-12T03:00:00Z',
  totalRequests24h: 184200,
};

// ============================================================================
// Service Layer Exported API Methods
// ============================================================================

export async function getAdminUsers(filters?: UserFilter): Promise<AdminUserItem[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<AdminUserItem[]>>('/admin/users', {
      params: {
        search: filters?.searchQuery,
        role: filters?.role !== 'ALL' ? filters?.role : undefined,
        status: filters?.status !== 'ALL' ? filters?.status : undefined,
      },
    });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Admin Users.', error);
  }

  let result = [...mockAdminUsers];

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.departmentName && u.departmentName.toLowerCase().includes(q))
    );
  }

  if (filters?.role && filters.role !== 'ALL') {
    result = result.filter((u) => u.role === filters.role);
  }

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((u) => u.status === filters.status);
  }

  return result;
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<AdminUserItem> {
  try {
    const res = await apiClient.put<BackendApiResponse<AdminUserItem>>(`/admin/users/${userId}/role`, {
      role: newRole,
    });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable. Updating role for mock user ${userId}.`, error);
  }

  const user = mockAdminUsers.find((u) => u.id === userId);
  if (user) {
    user.role = newRole;
    return user;
  }
  throw new Error(`User with ID ${userId} not found.`);
}

export async function updateUserStatus(userId: string, newStatus: UserStatus): Promise<AdminUserItem> {
  try {
    const res = await apiClient.put<BackendApiResponse<AdminUserItem>>(`/admin/users/${userId}/status`, {
      status: newStatus,
    });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable. Updating status for mock user ${userId}.`, error);
  }

  const user = mockAdminUsers.find((u) => u.id === userId);
  if (user) {
    user.status = newStatus;
    return user;
  }
  throw new Error(`User with ID ${userId} not found.`);
}

export async function createNewUser(payload: CreateUserPayload): Promise<AdminUserItem> {
  try {
    const res = await apiClient.post<BackendApiResponse<AdminUserItem>>('/admin/users', payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Creating mock user.', error);
  }

  const newUser: AdminUserItem = {
    id: `usr-${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    status: 'ACTIVE',
    departmentName: payload.departmentName || 'Computer Science',
    createdAt: new Date().toISOString(),
  };

  mockAdminUsers.unshift(newUser);
  return newUser;
}

export async function getAuditLogs(filters?: AuditLogFilter): Promise<AuditLogItem[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<AuditLogItem[]>>('/admin/audit-logs', {
      params: {
        search: filters?.searchQuery,
        severity: filters?.severity !== 'ALL' ? filters?.severity : undefined,
      },
    });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Audit Logs.', error);
  }

  let result = [...mockAuditLogs];

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (l) =>
        l.actorName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }

  if (filters?.severity && filters.severity !== 'ALL') {
    result = result.filter((l) => l.severity === filters.severity);
  }

  return result;
}

export async function getSystemHealth(): Promise<SystemHealthMetrics> {
  try {
    const res = await apiClient.get<BackendApiResponse<SystemHealthMetrics>>('/admin/system-health');
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock System Health Metrics.', error);
  }

  return mockSystemHealth;
}
