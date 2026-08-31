'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Activity, GraduationCap } from 'lucide-react';
import { GuestGuard } from '@/components/guards/GuestGuard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="min-h-screen grid lg:grid-cols-12 bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        {/* Left Branding & Highlights Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-r border-slate-800/80 overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-white">
                  UniPulse
                </span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Academic Success Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Value Proposition */}
          <div className="relative z-10 space-y-6 my-auto max-w-md">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Phase 3: Frontend Portals & Authentication</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Real-time Academic Intelligence & Early Risk Warning System.
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering students, lecturers, advisors, and administrators with unified performance analytics, predictive GPA modeling, and automated intervention workflows.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Security</span>
                </div>
                <p className="text-xl font-bold text-white">JWT + 401 Refresh</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Role-based API protection</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Portals</span>
                </div>
                <p className="text-xl font-bold text-white">4 Distinct Roles</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Student, Lecturer, Advisor, Admin</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 text-xs text-slate-500 border-t border-slate-800/60 pt-6">
            &copy; {new Date().getFullYear()} UniPulse Platform. Enterprise Academic Intelligence.
          </div>
        </div>

        {/* Right Dynamic Form Container */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-950">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center mb-6">
              <Link href="/" className="inline-flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <span className="font-extrabold text-xl text-white">UniPulse</span>
              </Link>
            </div>

            {children}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
