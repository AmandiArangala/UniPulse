'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Sparkles } from 'lucide-react';
import { SystemHealthMetrics } from '@/types/admin';
import { getSystemHealth } from '@/lib/admin-service';
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { toast } from 'sonner';

export default function AdminSystemHealthPage() {
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadHealth = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await getSystemHealth();
      setMetrics(data);
      if (showToast) {
        toast.success('System telemetry metrics refreshed!');
      }
    } catch (err) {
      console.error('Failed to load system health metrics:', err);
      toast.error('Failed to load system health metrics.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

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
            <span className="text-xs text-slate-300 font-medium">Infrastructure Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Global System Health & Monitoring
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time infrastructure performance gauges, CPU/RAM utilization, API latency metrics, and database engine health.
          </p>
        </div>
      </div>

      {/* Main Health Telemetry Dashboard */}
      {loading ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Fetching live infrastructure telemetry...
          </div>
        </div>
      ) : metrics ? (
        <SystemHealthDashboard
          metrics={metrics}
          onRefresh={() => loadHealth(true)}
          isRefreshing={isRefreshing}
        />
      ) : (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
          Failed to load system health metrics.
        </div>
      )}
    </div>
  );
}
