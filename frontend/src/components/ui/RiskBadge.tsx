import React from 'react';
import { RiskLevel } from '@/types/auth';

interface RiskBadgeProps {
  level?: RiskLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export function RiskBadge({ level, score, showScore = false, className = '' }: RiskBadgeProps) {
  const computedLevel: RiskLevel = level ?? (score !== undefined ? getRiskLevelFromScore(score) : 'LOW');

  const config: Record<RiskLevel, { pillClass: string; dotClass: string; label: string }> = {
    LOW: {
      pillClass: 'risk-pill-low',
      dotClass: 'bg-emerald-500',
      label: 'Low Risk',
    },
    MEDIUM: {
      pillClass: 'risk-pill-med',
      dotClass: 'bg-amber-500',
      label: 'Medium Attention',
    },
    HIGH: {
      pillClass: 'risk-pill-high',
      dotClass: 'bg-rose-500',
      label: 'High Risk',
    },
    CRITICAL: {
      pillClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
      dotClass: 'bg-rose-600',
      label: 'Critical Alert',
    },
  };

  const activeConfig = config[computedLevel] || config.LOW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeConfig.pillClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeConfig.dotClass}`} />
      <span>{activeConfig.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">({score})</span>
      )}
    </span>
  );
}
