'use client';

import React from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Database,
  Zap,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Globe,
  Radio,
} from 'lucide-react';
import { SystemHealthMetrics } from '@/types/admin';

interface SystemHealthDashboardProps {
  metrics: SystemHealthMetrics;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function SystemHealthDashboard({
  metrics,
  onRefresh,
  isRefreshing = false,
}: SystemHealthDashboardProps) {
  // Format uptime in Days, Hours, Minutes
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: 'HEALTHY' | 'DEGRADED' | 'DOWN') => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            HEALTHY
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEGRADED
          </span>
        );
      case 'DOWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              All Core Infrastructure Systems Operational
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              SLA Uptime Target: <strong className="text-slate-800 dark:text-slate-200">99.99%</strong> &bull; 24h Total Requests: <strong className="text-slate-800 dark:text-slate-200">{metrics.totalRequests24h.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Main Metric Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CPU Utilization */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-500" />
              CPU Utilization
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {metrics.cpuUsagePercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.cpuUsagePercent > 80
                  ? 'bg-rose-500'
                  : metrics.cpuUsagePercent > 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.cpuUsagePercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>8-Core vCPU Cluster</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Optimal Load</span>
          </div>
        </div>

        {/* Memory RAM Utilization */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-500" />
              RAM Memory Usage
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {metrics.memoryUsagePercent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.memoryUsagePercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>15.4 GB / 32.0 GB Allocated</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">Normal</span>
          </div>
        </div>

        {/* API Response Latency */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              API Latency (P95)
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {metrics.apiLatencyMs} ms
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (metrics.apiLatencyMs / 100) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Target: &le; 50 ms</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Fast</span>
          </div>
        </div>

        {/* Active Concurrent Connections */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-500" />
              Active Connections
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              WebSockets + HTTP
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {metrics.activeConnections}
          </div>
          <div className="text-xs text-slate-500">Live active sessions</div>
        </div>

        {/* Error Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              System Error Rate
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              SLA Compliant
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {metrics.errorRatePercent.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500">Target threshold &le; 0.10%</div>
        </div>

        {/* System Uptime */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              Continuous Uptime
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Online
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatUptime(metrics.uptimeSeconds)}
          </div>
          <div className="text-xs text-slate-500">No unhandled outages reported</div>
        </div>
      </div>

      {/* Database & Subservices Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PostgreSQL Relational Database */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  PostgreSQL Relational Database Engine
                </h3>
                <div className="text-xs text-slate-500">v16.2 Enterprise Cluster</div>
              </div>
            </div>
            {getStatusBadge(metrics.databaseStatus)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Connection Pool</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">28 / 50 Active</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Last Automated Backup</span>
              <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(metrics.lastBackupAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Redis Cache Engine */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Redis In-Memory Cache Engine
                </h3>
                <div className="text-xs text-slate-500">v7.2 High Availability Cluster</div>
              </div>
            </div>
            {getStatusBadge(metrics.redisStatus)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Cache Hit Rate</span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">94.8%</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">Key Store Memory</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">128 MB / 1 GB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
