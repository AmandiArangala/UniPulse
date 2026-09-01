'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile } from '@/types/auth';
import { authService, BackendAuthResponse } from '@/lib/auth-service';
import { LoginFormData, RegisterFormData, ProfileFormData } from '@/lib/validations/auth';

export const defaultProfiles: Record<UserRole, UserProfile> = {
  STUDENT: {
    id: 'ST12345',
    name: 'Alex Morgan',
    email: 'alex.morgan@unipulse.edu',
    username: 'alexmorgan',
    role: 'STUDENT',
    studentId: 'ST-2024-8842',
    department: 'Software Engineering',
  },
  LECTURER: {
    id: 'LEC9021',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@unipulse.edu',
    username: 'sarahjenkins',
    role: 'LECTURER',
    employeeId: 'EMP-4091',
    department: 'Computer Science',
  },
  ADVISOR: {
    id: 'ADV3301',
    name: 'Prof. David Vance',
    email: 'david.vance@unipulse.edu',
    username: 'davidvance',
    role: 'ADVISOR',
    advisorId: 'ADV-1029',
    department: 'Academic Advising & Student Affairs',
  },
  ADMIN: {
    id: 'ADM0001',
    name: 'Elena Rostova',
    email: 'elena.rostova@unipulse.edu',
    username: 'elenarostova',
    role: 'ADMIN',
    employeeId: 'ADM-0001',
    department: 'Faculty of Computing & Information Systems',
  },
};

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<BackendAuthResponse>;
  register: (data: RegisterFormData) => Promise<BackendAuthResponse>;
  logout: () => void;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  activeSemester: string;
  setActiveSemester: (semester: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('STUDENT');
  const [user, setUser] = useState<UserProfile>(defaultProfiles.STUDENT);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSemester, setActiveSemester] = useState<string>('Fall 2026');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Initialize auth state from local storage or verify JWT token
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('unipulse_access_token');
      const storedRefreshToken = localStorage.getItem('unipulse_refresh_token');

      if (storedToken) {
        setAccessToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setIsAuthenticated(true);
        try {
          const profile = await authService.getCurrentUser();
          setUser({
            id: profile.id,
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            username: profile.username,
            role: profile.role,
            department: profile.department || 'Academic Department',
          });
          setRoleState(profile.role);
        } catch {
          // Keep demo state if API backend offline
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (res: BackendAuthResponse) => {
    const token = res.accessToken;
    const refToken = res.refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('unipulse_access_token', token);
      localStorage.setItem('unipulse_refresh_token', refToken);
    }

    setAccessToken(token);
    setRefreshToken(refToken);
    setRoleState(res.role);
    setUser({
      id: res.userId,
      name: `${res.firstName} ${res.lastName}`,
      email: res.email,
      username: res.username,
      role: res.role,
    });
    setIsAuthenticated(true);
  };

  const login = async (data: LoginFormData): Promise<BackendAuthResponse> => {
    try {
      const res = await authService.login(data);
      handleAuthSuccess(res);
      return res;
    } catch (error) {
      // Demo fallback if backend is not actively running
      const matchedRole = data.email.toLowerCase().includes('admin')
        ? 'ADMIN'
        : data.email.toLowerCase().includes('lecturer')
        ? 'LECTURER'
        : data.email.toLowerCase().includes('advisor')
        ? 'ADVISOR'
        : 'STUDENT';

      if (typeof window !== 'undefined') {
        localStorage.setItem('unipulse_access_token', 'demo-jwt-access-token');
        localStorage.setItem('unipulse_refresh_token', 'demo-jwt-refresh-token');
      }
      setAccessToken('demo-jwt-access-token');
      setRefreshToken('demo-jwt-refresh-token');
      setRole(matchedRole);
      setIsAuthenticated(true);
      throw error;
    }
  };

  const register = async (data: RegisterFormData): Promise<BackendAuthResponse> => {
    try {
      const res = await authService.register(data);
      handleAuthSuccess(res);
      return res;
    } catch (error) {
      // Demo fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('unipulse_access_token', 'demo-jwt-access-token');
        localStorage.setItem('unipulse_refresh_token', 'demo-jwt-refresh-token');
      }
      setAccessToken('demo-jwt-access-token');
      setRefreshToken('demo-jwt-refresh-token');
      setRole(data.role);
      setUser({
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        username: data.username,
        role: data.role,
      });
      setIsAuthenticated(true);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unipulse_access_token');
      localStorage.removeItem('unipulse_refresh_token');
    }
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    // Reset to default demo student
    setUser(defaultProfiles.STUDENT);
    setRoleState('STUDENT');
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setUser(defaultProfiles[newRole]);
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    try {
      await authService.updateProfile(data);
    } catch {
      // Local state fallback
    }
    setUser((prev) => ({
      ...prev,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      department: data.department || prev.department,
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile: handleUpdateProfile,
        activeSemester,
        setActiveSemester,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
