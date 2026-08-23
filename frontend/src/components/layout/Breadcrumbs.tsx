'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { role } = useAuth();

  const segments = pathname.split('/').filter(Boolean);

  const roleNameMap: Record<string, string> = {
    STUDENT: 'Academic Pulse & Twin',
    LECTURER: 'Module Intelligence',
    ADVISOR: 'Student 360 & Interventions',
    ADMIN: 'Institutional Analytics',
  };

  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
      <Link
        href="/"
        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>UniPulse</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

      <span className="capitalize text-indigo-600 dark:text-indigo-400 font-semibold">
        {roleNameMap[role] || role.toLowerCase()}
      </span>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const title = segment.replace(/-/g, ' ');

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="capitalize text-slate-800 dark:text-slate-200 font-medium">
                {title}
              </span>
            ) : (
              <Link
                href={href}
                className="capitalize hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
