export type UserRole = 'STUDENT' | 'LECTURER' | 'ADVISOR' | 'ADMIN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  advisorId?: string;
  employeeId?: string;
  username?: string;
}

export interface AuthState {
  user: UserProfile;
  role: UserRole;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
}

