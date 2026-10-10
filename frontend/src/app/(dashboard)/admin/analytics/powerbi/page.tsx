'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PowerBIFilterBar } from '@/components/analytics/PowerBIFilterBar';
import { DAXMeasureCard } from '@/components/analytics/DAXMeasureCard';
import { StarSchemaDiagram } from '@/components/analytics/StarSchemaDiagram';
import { powerBIService } from '@/lib/powerbi-service';
import { PowerBISemanticModel, DAXMeasure, PowerBIFilterState } from '@/types/powerbi';
import {
  BarChart3,
  Database,
  Layers,
  Sparkles,
  Download,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Activity,
  Code,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PowerBIAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'dax' | 'schema' | 'report'>('dax');
  const [semanticModel, setSemanticModel] = useState<PowerBISemanticModel | null>(null);
  const [selectedMeasure, setSelectedMeasure] = useState<DAXMeasure | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<PowerBIFilterState>({
    semester: 'ALL',
    faculty: 'ALL',
    department: 'ALL',
    riskStatus: 'ALL',
  });

  const loadSemanticData = async () => {
    setIsLoading(true);
    try {
      const modelData = await powerBIService.getSemanticModel(filters.semester, filters.faculty);
      setSemanticModel(modelData);
      if (modelData.daxMeasures && modelData.daxMeasures.length > 0) {
        setSelectedMeasure(modelData.daxMeasures[0]);
      }
    } catch {
      toast.error('Failed to sync Power BI semantic model.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSemanticData();
  }, [filters.semester, filters.faculty]);

  const handleExportPBIDS = () => {
    const pbidsContent = JSON.stringify(
      {
        version: '0.1',
        connections: [
          {
            details: {
              protocol: 'postgresql',
              address: {
                server: 'localhost',
                database: 'unipulse_db',
              },
              authentication: null,
              query: null,
            },
            options: {
              CreateNavigationProperties: false,
              CommandTimeout: 'PT15M',
            },
            mode: 'DirectQuery',
          },
        ],
      },
      null,
      2
    );

    const blob = new Blob([pbidsContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'unipulse_analytics.pbids';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Downloaded Power BI Data Source Connector (.pbids)');
  };

  const handleExportCSV = () => {
    if (!semanticModel) return;
    const headers = ['Measure Name', 'DAX Formula', 'Calculated Value', 'Unit', 'Category', 'Status'];
    const rows = semanticModel.daxMeasures.map((m) => [
      `"${m.name}"`,
      `"${m.daxFormula.replace(/"/g, '""')}"`,
      m.calculatedValue,
      `"${m.unit}"`,
      `"${m.category}"`,
      `"${m.statusIndicator}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unipulse_dax_measures_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Exported DAX Measures summary CSV dataset');
  };

  const filteredMeasures = (semanticModel?.daxMeasures || []).filter((m) => {
    if (filters.riskStatus === 'ALL') return true;
    return m.statusIndicator === filters.riskStatus;
  });

  return (
    <div className="space-y-6 min-h-screen text-slate-100 pb-12">
      <Breadcrumbs />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 p-6 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 6: BI Reporting & Analytics Hub
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                PostgreSQL DirectQuery
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Power BI Data Modeling & DAX Measures Engine
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Star Schema data warehouse relationships ($1 : *$), DAX metric calculations (`[Avg GPA]`, `[Pass Rate %]`, `[Attendance %]`, `[High Risk Count]`, `[Intervention Success Rate %]`), and Power BI semantic layer integration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPBIDS}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30"
            >
              <Download className="w-4 h-4" />
              <span>Get Power BI (.PBIDS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slicer & Controls Bar */}
      <PowerBIFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={loadSemanticData}
        onExportPBIDS={handleExportPBIDS}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('dax')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'dax'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>DAX Measures Library ({filteredMeasures.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'schema'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Star Schema Relationships</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'report'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Power BI Embedded Viewport</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'dax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeasures.map((measure) => (
              <DAXMeasureCard
                key={measure.measureKey}
                measure={measure}
                isSelected={selectedMeasure?.measureKey === measure.measureKey}
                onSelect={(m) => setSelectedMeasure(m)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <StarSchemaDiagram
          relationships={semanticModel?.relationships || []}
          factTableName={semanticModel?.factTable}
          dimensionTables={semanticModel?.dimensionTables}
          totalFactRecords={semanticModel?.totalFactRecords}
        />
      )}

      {activeTab === 'report' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Power BI Interactive Report Viewport
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated live Power BI report canvas displaying calculated measures and Star Schema visualizations.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Live Connection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block mb-1">[Pass Rate %] Visual Gauge</span>
              <div className="text-2xl font-black text-emerald-400 my-1">88.5%</div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88.5%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block mb-1">[High Risk Count] Cohort</span>
              <div className="text-2xl font-black text-amber-400 my-1">14 Students</div>
              <p className="text-[11px] text-slate-400">CRITICAL + ATTENTION_REQUIRED</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block mb-1">[Intervention Success Rate %]</span>
              <div className="text-2xl font-black text-blue-400 my-1">76.4%</div>
              <p className="text-[11px] text-slate-400">Restored to Satisfactory Standing</p>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
            <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-80" />
            <h4 className="text-base font-bold text-slate-200 mb-1">Power BI Desktop & Service Connected</h4>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mb-4">
              To inspect this semantic model inside Power BI Desktop with full interactive slice-and-dice capabilities, click below to open via the generated `.pbids` file.
            </p>
            <button
              type="button"
              onClick={handleExportPBIDS}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Power BI Semantic Connector (.pbids)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
