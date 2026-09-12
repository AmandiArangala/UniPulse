'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Users, Lock, UserCheck, Sparkles } from 'lucide-react';
import { AdminUserItem, UserStatus, CreateUserPayload } from '@/types/admin';
import { UserRole } from '@/types/auth';
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  createNewUser,
} from '@/lib/admin-service';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { toast } from 'sonner';

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load system admin users:', err);
      toast.error('Failed to load system user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.departmentName && u.departmentName.toLowerCase().includes(q))
      );
    }

    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((u) => u.status === statusFilter);
    }

    return result;
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole} for ${updated.fullName}!`);
      loadUsers();
    } catch (err: any) {
      console.error('Failed to update role:', err);
      toast.error('Failed to update user role.');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      const updated = await updateUserStatus(userId, newStatus);
      toast.success(`Account status set to ${newStatus} for ${updated.fullName}!`);
      loadUsers();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update account status.');
    }
  };

  const handleCreateUser = async (payload: CreateUserPayload) => {
    try {
      const created = await createNewUser(payload);
      toast.success(`New system user provisioned for ${created.fullName}!`);
      loadUsers();
    } catch (err: any) {
      console.error('Failed to create user:', err);
      toast.error('Failed to provision new user.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              System Admin Portal
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300 font-medium">User Directory & Roles</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Identity & Role Assignment Portal
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage institutional user accounts, assign system access roles, suspend accounts, and provision new users.
          </p>
        </div>
      </div>

      {/* Main Table Component */}
      {loading ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading system user directory...
          </div>
        </div>
      ) : (
        <UserManagementTable
          users={filteredUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onUpdateRole={handleUpdateRole}
          onUpdateStatus={handleUpdateStatus}
          onCreateUser={handleCreateUser}
        />
      )}
    </div>
  );
}
