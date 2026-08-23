'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, setRole } = useAuth();

  if (!allowedRoles.includes(role)) {
    return (
      <div className="p-8 my-6 unipulse-card text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Role Access Restricted
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This section requires <span className="font-semibold text-slate-700 dark:text-slate-200">{allowedRoles.join(' or ')}</span> permissions. Your active view is set to <span className="font-semibold text-indigo-600">{role}</span>.
        </p>
        <div className="pt-2 flex justify-center space-x-2">
          {allowedRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Switch to {r} View
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
