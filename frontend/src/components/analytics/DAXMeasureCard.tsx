'use client';

import React, { useState } from 'react';
import { DAXMeasure } from '@/types/powerbi';
import {
  Code,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Database,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface DAXMeasureCardProps {
  measure: DAXMeasure;
  isSelected?: boolean;
  onSelect?: (measure: DAXMeasure) => void;
}

export const DAXMeasureCard: React.FC<DAXMeasureCardProps> = ({
  measure,
  isSelected = false,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyDAX = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(measure.daxFormula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: DAXMeasure['statusIndicator']) => {
    switch (status) {
      case 'SATISFACTORY':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Optimal
          </span>
        );
      case 'ATTENTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Attention Needed
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Critical Risk
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect?.(measure)}
      className={`group relative rounded-xl border p-5 transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-md ${
        isSelected
          ? 'bg-slate-900/90 border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm tracking-wide group-hover:text-blue-400 transition-colors">
              {measure.name}
            </h4>
            <span className="text-xs text-slate-400 font-mono">{measure.category}</span>
          </div>
        </div>
        {getStatusBadge(measure.statusIndicator)}
      </div>

      {/* Main Metric Display */}
      <div className="flex items-baseline justify-between my-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {typeof measure.calculatedValue === 'number'
              ? measure.calculatedValue.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : measure.calculatedValue}
          </span>
          <span className="text-sm font-semibold text-slate-400">{measure.unit}</span>
        </div>

        {/* Target Variance */}
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
            measure.varianceFromTarget >= 0
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-rose-500/10 text-rose-400'
          }`}
        >
          {measure.varianceFromTarget >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {measure.varianceFromTarget >= 0 ? '+' : ''}
            {measure.varianceFromTarget.toFixed(1)} {measure.unit} vs Target
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {measure.description}
      </p>

      {/* DAX Drawer Toggle Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{isExpanded ? 'Hide DAX Formula' : 'Inspect DAX & SQL Formula'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyDAX}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          title="Copy DAX Expression"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Expandable Code Drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Calculator className="w-3 h-3" /> Power BI DAX Expression
              </span>
            </div>
            <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-amber-200 overflow-x-auto whitespace-pre-wrap">
              {measure.daxFormula}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Database className="w-3 h-3" /> PostgreSQL SQL Equivalent
              </span>
            </div>
            <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto whitespace-pre-wrap">
              {measure.sqlEquivalent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
