'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  Shield,
  ShieldAlert,
  UserPlus,
  Edit2,
  Lock,
  Unlock,
  X,
  User,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AdminUserItem, UserStatus, CreateUserPayload } from '@/types/admin';
import { UserRole } from '@/types/auth';

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
  // Role Edit Modal State
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('STUDENT');
  const [newDept, setNewDept] = useState<string>('Computer Science');

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  const resetFilters = () => {
    onSearchChange('');
    onRoleFilterChange('ALL');
    onStatusFilterChange('ALL');
  };

  const handleOpenRoleModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateRole(editingUser.id, selectedRole);
      setEditingUser(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    onCreateUser({
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      departmentName: newDept.trim(),
    });

    setNewFullName('');
    setNewEmail('');
    setNewRole('STUDENT');
    setIsCreateModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            ADMIN
          </span>
        );
      case 'ADVISOR':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            ADVISOR
          </span>
        );
      case 'LECTURER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            LECTURER
          </span>
        );
      case 'STUDENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" />
            STUDENT
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            INACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            SUSPENDED
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
      {/* Top Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search system user name, email, or department..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Add User Trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value as UserRole | 'ALL')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All System Roles</option>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="ADVISOR">Advisor</option>
              <option value="ADMIN">System Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as UserStatus | 'ALL')}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New System User</span>
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">User Profile</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Last Active</th>
              <th className="py-3.5 px-4 text-right">Actions & Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                          {u.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(u.status)}</td>

                  {/* Department */}
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                    {u.departmentName || '&mdash;'}
                  </td>

                  {/* Last Active */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenRoleModal(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1"
                        title="Change System Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Assign Role</span>
                      </button>

                      {u.status === 'SUSPENDED' ? (
                        <button
                          onClick={() => onUpdateStatus(u.id, 'ACTIVE')}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:border-emerald-800 transition-colors"
                          title="Reactivate Account"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(u.id, 'SUSPENDED')}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors"
                          title="Suspend Account"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                  No system users matched your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Role Assignment Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Assign System Role
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                User: <strong>{editingUser.fullName}</strong> ({editingUser.email})
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-500">
                  Select Target Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="STUDENT">STUDENT (Course & Grade View)</option>
                  <option value="LECTURER">LECTURER (Assessment & Marks Entry)</option>
                  <option value="ADVISOR">ADVISOR (Caseload & Student 360)</option>
                  <option value="ADMIN">ADMIN (Full Institutional System Admin)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision New System User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Provision New System User
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-500">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-500">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. a.pendelton@unipulse.edu"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-500">Initial System Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LECTURER">LECTURER</option>
                  <option value="ADVISOR">ADVISOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-500">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
