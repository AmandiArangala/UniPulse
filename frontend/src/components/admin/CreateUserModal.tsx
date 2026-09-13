'use client';

import React, { useState } from 'react';
import { X, UserPlus, Shield, Mail, Building, Key, RefreshCw } from 'lucide-react';
import { CreateUserPayload } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void> | void;
}

export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [departmentName, setDepartmentName] = useState('Computer Science');
  const [password, setPassword] = useState('TempPass#2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    toast.info('Generated new temporary password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('A valid institution email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        departmentName,
        password,
      });
      toast.success(`User ${fullName} created successfully`, {
        description: `Role assigned: ${role} | Department: ${departmentName}`,
      });
      // Reset form
      setFullName('');
      setEmail('');
      setRole('STUDENT');
      onClose();
    } catch (err) {
      toast.error('Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Create New User Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provision access credentials and assign institutional role
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Jane Doe or Alex Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Institution Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="e.g. user@unipulse.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Role & Department Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Assign System Role
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="ADVISOR">Academic Advisor</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Business Analytics">Business Analytics</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                </select>
              </div>
            </div>
          </div>

          {/* Temporary Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Temporary Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto Generate</span>
              </button>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
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
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
