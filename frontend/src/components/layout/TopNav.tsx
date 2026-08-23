'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  User,
  CheckCircle2,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

export function TopNav() {
  const { role, setRole, activeSemester, setActiveSemester, isSidebarOpen, toggleSidebar, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: { id: UserRole; label: string }[] = [
    { id: 'STUDENT', label: 'Student' },
    { id: 'LECTURER', label: 'Lecturer' },
    { id: 'ADVISOR', label: 'Advisor' },
    { id: 'ADMIN', label: 'Admin' },
  ];

  const semesters = ['Fall 2026', 'Spring 2026', 'Fall 2025'];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    toast.success(`Switched workspace to ${newRole} view`, {
      description: `Viewing platform as ${defaultRoleTitles[newRole]}`,
    });
  };

  const defaultRoleTitles: Record<UserRole, string> = {
    STUDENT: 'Alex Morgan (Student)',
    LECTURER: 'Dr. Sarah Jenkins (Lecturer)',
    ADVISOR: 'Prof. David Vance (Academic Advisor)',
    ADMIN: 'Elena Rostova (Department Administrator)',
  };

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        isSidebarOpen ? 'ml-64' : 'ml-20'
      }`}
    >
      {/* Search Input & Mobile Toggle */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, modules, assessments, advisors..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher Pills (As specified in Figma Prompt) */}
        <div className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Role:
          </span>
          {roles.map((r) => {
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Active Semester Dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <select
              value={activeSemester}
              onChange={(e) => setActiveSemester(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold pr-1"
            >
              {semesters.map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Alerts
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  3 New
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Attendance Drop Warning
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Database Systems attendance dropped below 70%
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Intervention Resolved
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Peer tutoring session completed for ST-2024-8842
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-800">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden xl:block text-xs font-semibold text-slate-800 dark:text-slate-200">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
