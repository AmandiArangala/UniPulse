'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calendar,
  Activity,
  AlertTriangle,
  Users,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  FolderGit2,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { label: 'Academic Pulse', href: '/', icon: LayoutDashboard },
    { label: 'Enrolled Modules', href: '/student/modules', icon: BookOpen },
    { label: 'What-If Simulator', href: '/student/simulator', icon: Sliders, badge: 'Tool' },
    { label: 'Academic Twin', href: '/student/twin', icon: Activity },
    { label: 'Student Journey', href: '/student/journey', icon: Calendar },
    { label: 'Profile & Security', href: '/profile', icon: User },
  ],
  LECTURER: [
    { label: 'Module Radar', href: '/', icon: LayoutDashboard },
    { label: 'Attention Queue', href: '/lecturer/attention', icon: AlertTriangle, badge: '14' },
    { label: 'Difficulty Analyzer', href: '/lecturer/difficulty', icon: BarChart3 },
    { label: 'Assessments', href: '/lecturer/assessments', icon: BookOpen },
    { label: 'Profile & Security', href: '/profile', icon: User },
  ],
  ADVISOR: [
    { label: 'Caseload Matrix', href: '/', icon: LayoutDashboard },
    { label: 'Interventions', href: '/advisor/interventions', icon: Users, badge: 'Active' },
    { label: 'Outcome Analytics', href: '/advisor/analytics', icon: BarChart3 },
    { label: 'Profile & Security', href: '/profile', icon: User },
  ],
  ADMIN: [
    { label: 'Institutional Analytics', href: '/', icon: LayoutDashboard },
    { label: 'Cohort Comparison', href: '/admin/cohorts', icon: GraduationCap },
    { label: 'Difficulty Index', href: '/admin/modules', icon: FolderGit2 },
    { label: 'ETL & Data Quality', href: '/admin/data-quality', icon: ShieldCheck, badge: 'Clean' },
    { label: 'Profile & Security', href: '/profile', icon: User },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isSidebarOpen, toggleSidebar, user, logout } = useAuth();

  const currentNavItems = navItemsByRole[role] || navItemsByRole.STUDENT;

  const handleLogout = () => {
    logout();
    toast.info('Signed out', {
      description: 'You have been safely logged out of UniPulse.',
    });
    router.push('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200 dark:shadow-none flex-shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg leading-tight">
                UniPulse
              </span>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                Academic Intel
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {isSidebarOpen && (
        <div className="mx-3 mt-4 mb-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Active Workspace
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center justify-between">
            <span>{role} VIEW</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 group relative ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}

              {isSidebarOpen && item.badge && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="flex items-center space-x-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign out of UniPulse"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

