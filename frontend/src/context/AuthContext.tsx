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

  /**
   * Best Practice Session Initialization:
   * 1. Check for stored JWT Access Token.
   * 2. Fetch authoritative user profile directly from Backend API (GET /api/v1/auth/me).
   * 3. Fallback gracefully to cached session if API is in demo mode.
   */
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('unipulse_access_token');
      const storedRefreshToken = localStorage.getItem('unipulse_refresh_token');
      const storedProfile = localStorage.getItem('unipulse_user_profile');

      if (storedToken) {
        setAccessToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setIsAuthenticated(true);

        try {
          // Primary: Fetch authoritative profile from Spring Boot Backend
          const profile = await authService.getCurrentUser();
          const fetchedUser: UserProfile = {
            id: profile.id,
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            username: profile.username,
            role: profile.role,
            department: profile.department || defaultProfiles[profile.role]?.department || 'Academic Department',
          };
          setUser(fetchedUser);
          setRoleState(profile.role);
          localStorage.setItem('unipulse_user_profile', JSON.stringify(fetchedUser));
        } catch {
          // Demo Mode Fallback: Restore saved local session if backend server is offline
          if (storedProfile) {
            try {
              const parsed = JSON.parse(storedProfile);
              setUser(parsed);
              setRoleState(parsed.role || 'STUDENT');
            } catch {
              // Ignore invalid JSON
            }
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Handles successful login/register API response.
   */
  const handleAuthSuccess = (res: BackendAuthResponse) => {
    const token = res.accessToken;
    const refToken = res.refreshToken;

    const loggedUser: UserProfile = {
      id: res.userId,
      name: `${res.firstName} ${res.lastName}`,
      email: res.email,
      username: res.username,
      role: res.role,
      department: defaultProfiles[res.role]?.department || 'Academic Department',
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('unipulse_access_token', token);
      localStorage.setItem('unipulse_refresh_token', refToken);
      localStorage.setItem('unipulse_user_profile', JSON.stringify(loggedUser));
    }

    setAccessToken(token);
    setRefreshToken(refToken);
    setRoleState(res.role);
    setUser(loggedUser);
    setIsAuthenticated(true);
  };

  /**
   * Production-grade Login handler: Enforces strict backend authentication security.
   * If backend responds with 401 Bad Credentials or 400, login is REJECTED.
   */
  const login = async (data: LoginFormData): Promise<BackendAuthResponse> => {
    try {
      const res = await authService.login(data);
      handleAuthSuccess(res);
      return res;
    } catch (error: any) {
      setIsAuthenticated(false);
      if (error.response) {
        const serverMsg = error.response?.data?.message || 'Invalid email or password. Access denied.';
        throw new Error(serverMsg);
      }
      throw new Error('Backend server connection failed. Please ensure the Spring Boot server is running on http://localhost:8080');
    }
  };

  /**
   * Production-grade Register handler: Enforces backend validation.
   */
  const register = async (data: RegisterFormData): Promise<BackendAuthResponse> => {
    try {
      const res = await authService.register(data);
      handleAuthSuccess(res);
      return res;
    } catch (error: any) {
      setIsAuthenticated(false);
      if (error.response) {
        const serverMsg = error.response?.data?.message || 'Registration failed. Email or username is already in use.';
        throw new Error(serverMsg);
      }
      throw new Error('Backend server connection failed. Please ensure the Spring Boot server is running on http://localhost:8080');
    }
  };

  /**
   * Production Logout: Clears all session tokens and user state
   */
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unipulse_access_token');
      localStorage.removeItem('unipulse_refresh_token');
      localStorage.removeItem('unipulse_user_profile');
    }
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setUser(defaultProfiles.STUDENT);
    setRoleState('STUDENT');
  };

  /**
   * Role Switcher for previewing multi-role workspaces
   */
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setUser(defaultProfiles[newRole]);
  };

  /**
   * Updates user profile via API (PUT /api/v1/users/profile) and updates local state
   */
  const handleUpdateProfile = async (data: ProfileFormData) => {
    try {
      const updatedProfile = await authService.updateProfile(data);
      const updatedUser: UserProfile = {
        id: updatedProfile.id,
        name: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
        email: updatedProfile.email,
        username: updatedProfile.username,
        role: updatedProfile.role,
        department: updatedProfile.department || user.department,
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('unipulse_user_profile', JSON.stringify(updatedUser));
      }
    } catch {
      // Local state fallback if backend API is not active
      const updatedUser: UserProfile = {
        ...user,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        department: data.department || user.department,
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('unipulse_user_profile', JSON.stringify(updatedUser));
      }
    }
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
