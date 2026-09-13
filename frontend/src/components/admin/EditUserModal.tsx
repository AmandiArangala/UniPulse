'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Building, Power, AlertTriangle, CheckCircle2, UserCheck } from 'lucide-react';
import { AdminUserItem, UserStatus } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface EditUserModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void> | void;
  onUpdateStatus: (userId: string, newStatus: UserStatus) => Promise<void> | void;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUpdateRole,
  onUpdateStatus,
}: EditUserModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedStatus(user.status);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let changed = false;

      if (selectedRole !== user.role) {
        await onUpdateRole(user.id, selectedRole);
        changed = true;
      }
      if (selectedStatus !== user.status) {
        await onUpdateStatus(user.id, selectedStatus);
        changed = true;
      }

      if (changed) {
        toast.success(`Updated account for ${user.fullName}`, {
          description: `Role: ${selectedRole} | Status: ${selectedStatus}`,
        });
      } else {
        toast.info('No changes were made.');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to update user account settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit User Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {user.fullName} ({user.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* User Profile Quick Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-indigo-600 flex items-center justify-center font-bold text-sm">
              {user.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.fullName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.departmentName || 'General Department'}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Role
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="ADVISOR">Academic Advisor</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          {/* Account Status Radio Toggles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Account Status & Access Control
            </label>

            <div className="space-y-2">
              {/* ACTIVE */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'ACTIVE'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={selectedStatus === 'ACTIVE'}
                    onChange={() => setSelectedStatus('ACTIVE')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">ACTIVE</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Full access to UniPulse features and services.
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </label>

              {/* INACTIVE */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'INACTIVE'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="status"
                    value="INACTIVE"
                    checked={selectedStatus === 'INACTIVE'}
                    onChange={() => setSelectedStatus('INACTIVE')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">INACTIVE / DEACTIVATED</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Temporarily disabled. User cannot log in.
                    </span>
                  </div>
                </div>
                <Power className="w-4 h-4 text-amber-500 flex-shrink-0" />
              </label>

              {/* SUSPENDED */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === 'SUSPENDED'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="status"
                    value="SUSPENDED"
                    checked={selectedStatus === 'SUSPENDED'}
                    onChange={() => setSelectedStatus('SUSPENDED')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">SUSPENDED</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Flagged for disciplinary or security investigation.
                    </span>
                  </div>
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
