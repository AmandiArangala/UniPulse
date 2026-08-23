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

  const config = {
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
  }[computedLevel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all ${config.pillClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dotClass}`} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">({score})</span>
      )}
    </span>
  );
}
