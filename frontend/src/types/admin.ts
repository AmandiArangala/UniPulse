/**
 * UniPulse System Admin Portal Data Types & Structures
 * Phase 3: Frontend Portals - Day 14 (Admin Portal)
 */

import { UserRole } from './auth';
export type { UserRole };

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId?: string;
  departmentName?: string;
  lastLoginAt?: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface UserFilter {
  searchQuery?: string;
  role?: UserRole | 'ALL';
  status?: UserStatus | 'ALL';
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: UserRole;
  departmentName?: string;
  password?: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export type AuditLogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  severity: AuditLogSeverity;
}

export interface AuditLogFilter {
  searchQuery?: string;
  severity?: AuditLogSeverity | 'ALL';
  role?: UserRole | 'ALL';
}

export interface SystemHealthMetrics {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  activeConnections: number;
  apiLatencyMs: number;
  errorRatePercent: number;
  databaseStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  redisStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  lastBackupAt: string;
  totalRequests24h: number;
}
