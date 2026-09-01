'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/guards/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
        <Sidebar />
        <TopNav />
        
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

