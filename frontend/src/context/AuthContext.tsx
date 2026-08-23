'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile } from '@/types/auth';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSemester: string;
  setActiveSemester: (semester: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const defaultProfiles: Record<UserRole, UserProfile> = {
  STUDENT: {
    id: 'ST12345',
    name: 'Alex Morgan',
    email: 'alex.morgan@unipulse.edu',
    role: 'STUDENT',
    studentId: 'ST-2024-8842',
    department: 'Software Engineering',
  },
  LECTURER: {
    id: 'LEC9021',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@unipulse.edu',
    role: 'LECTURER',
    employeeId: 'EMP-4091',
    department: 'Computer Science',
  },
  ADVISOR: {
    id: 'ADV3301',
    name: 'Prof. David Vance',
    email: 'david.vance@unipulse.edu',
    role: 'ADVISOR',
    advisorId: 'ADV-1029',
    department: 'Academic Advising & Student Affairs',
  },
  ADMIN: {
    id: 'ADM0001',
    name: 'Elena Rostova',
    email: 'elena.rostova@unipulse.edu',
    role: 'ADMIN',
    employeeId: 'ADM-0001',
    department: 'Faculty of Computing & Information Systems',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('STUDENT');
  const [user, setUser] = useState<UserProfile>(defaultProfiles.STUDENT);
  const [activeSemester, setActiveSemester] = useState<string>('Fall 2026');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setUser(defaultProfiles[newRole]);
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
