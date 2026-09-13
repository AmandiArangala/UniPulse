'use client';

import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  Shield,
  ShieldAlert,
  UserPlus,
  Edit2,
  Lock,
  Unlock,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AdminUserItem, UserStatus, CreateUserPayload } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';

interface UserManagementTableProps {
  users: AdminUserItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: UserRole | 'ALL';
  onRoleFilterChange: (role: UserRole | 'ALL') => void;
  statusFilter: UserStatus | 'ALL';
  onStatusFilterChange: (status: UserStatus | 'ALL') => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onUpdateStatus: (userId: string, newStatus: UserStatus) => void;
  onCreateUser: (payload: CreateUserPayload) => void;
}

export function UserManagementTable({
  users,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onUpdateRole,
  onUpdateStatus,
  onCreateUser,
}: UserManagementTableProps) {
  // Modal State
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 inline-flex items-center gap-1">
            INACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            PENDING
          </span>
        );
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      case 'ADVISOR':
        return <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />;
      case 'LECTURER':
        return <BookOpen className="w-3.5 h-3.5 text-amber-500" />;
      case 'STUDENT':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center space-x-3 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user directory by name, email, or department..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value as UserRole | 'ALL')}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="ADVISOR">Advisor</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as UserStatus | 'ALL')}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start lg:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3.5 px-4">User Identity</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No matching users found in directory.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {u.fullName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">
                            {u.fullName}
                          </span>
                          <span className="text-slate-400 text-xs">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                        {getRoleIcon(u.role)}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {u.departmentName || 'General Academic'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(u.status)}</td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never logged in'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Toggle Active Status Button */}
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => onUpdateStatus(u.id, 'INACTIVE')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Deactivate Account"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(u.id, 'ACTIVE')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Activate Account"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Role / Settings Button */}
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Role & Settings"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Provisioning Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateUser}
      />

      {/* Role & Status Edit Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUpdateRole={onUpdateRole}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
