'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { ShieldAlert, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export default function UnauthorizedPage() {
  const { role, setRole } = useAuth();

  const handleSwitchRole = (targetRole: UserRole) => {
    setRole(targetRole);
    toast.success(`Switched workspace view to ${targetRole}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your current workspace role (<span className="font-bold text-indigo-400">{role}</span>) does not have authorization to view this feature or administrative portal.
          </p>
        </div>

        {/* Quick Role Switcher for Demo */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Demo Workspace Quick Switcher
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(['STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleSwitchRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  role === r
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {r} View
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
