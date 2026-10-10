'use client';

import React from 'react';
import { PowerBIFilterState } from '@/types/powerbi';
import {
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Building,
  AlertTriangle,
  RotateCcw,
  Search,
  FileSpreadsheet,
} from 'lucide-react';

interface PowerBIFilterBarProps {
  filters: PowerBIFilterState;
  onFilterChange: (newFilters: PowerBIFilterState) => void;
  onRefresh?: () => void;
  onExportPBIDS?: () => void;
  onExportCSV?: () => void;
  isLoading?: boolean;
}

export const PowerBIFilterBar: React.FC<PowerBIFilterBarProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  onExportPBIDS,
  onExportCSV,
  isLoading = false,
}) => {
  const handleReset = () => {
    onFilterChange({
      semester: 'ALL',
      faculty: 'ALL',
      department: 'ALL',
      riskStatus: 'ALL',
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Title & Slicers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-slate-200">Data Slicers</span>
          </div>

          {/* Semester Selector */}
          <div className="relative">
            <select
              value={filters.semester}
              onChange={(e) => onFilterChange({ ...filters, semester: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Semesters</option>
              <option value="Semester 1 2026">Semester 1 (2026)</option>
              <option value="Semester 2 2026">Semester 2 (2026)</option>
              <option value="Semester 1 2025">Semester 1 (2025)</option>
            </select>
          </div>

          {/* Faculty Selector */}
          <div className="relative">
            <select
              value={filters.faculty}
              onChange={(e) => onFilterChange({ ...filters, faculty: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Faculties</option>
              <option value="Engineering">Faculty of Engineering</option>
              <option value="Computing">Faculty of Computing</option>
              <option value="Science">Faculty of Science</option>
              <option value="Business">Faculty of Business</option>
            </select>
          </div>

          {/* Risk Status Filter */}
          <div className="relative">
            <select
              value={filters.riskStatus}
              onChange={(e) => onFilterChange({ ...filters, riskStatus: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="SATISFACTORY">Satisfactory</option>
              <option value="ATTENTION_REQUIRED">Attention Required</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Sync Model</span>
            </button>
          )}

          {onExportPBIDS && (
            <button
              type="button"
              onClick={onExportPBIDS}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .PBIDS Connector</span>
            </button>
          )}

          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
