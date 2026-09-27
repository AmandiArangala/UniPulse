import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AttentionCategoryTier } from '@/types/attentionIndicator';

interface AttentionBadgeProps {
  categoryTier?: AttentionCategoryTier;
  score?: number;
  badgeLabel?: string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AttentionBadge({
  categoryTier,
  score,
  badgeLabel,
  showScore = false,
  size = 'md',
  interactive = false,
  onClick,
  className = '',
}: AttentionBadgeProps) {
  const computedTier: AttentionCategoryTier =
    categoryTier ??
    (score !== undefined
      ? score >= 60
        ? 'HIGH_ATTENTION'
        : score >= 30
        ? 'MEDIUM_ATTENTION'
        : 'LOW_ATTENTION'
      : 'LOW_ATTENTION');

  const configs: Record<
    AttentionCategoryTier,
    {
      badgeClass: string;
      dotClass: string;
      icon: React.ReactNode;
      defaultLabel: string;
      description: string;
    }
  > = {
    LOW_ATTENTION: {
      badgeClass:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/5',
      dotClass: 'bg-emerald-500',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
      defaultLabel: 'Good Standing',
      description: 'Low attention required (Score: 0 - 29/100). Student is meeting academic expectations.',
    },
    MEDIUM_ATTENTION: {
      badgeClass:
        'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 shadow-sm shadow-amber-500/5',
      dotClass: 'bg-amber-500',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
      defaultLabel: 'Moderate Focus Needed',
      description: 'Medium attention required (Score: 30 - 59/100). Proactive check-in recommended.',
    },
    HIGH_ATTENTION: {
      badgeClass:
        'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 shadow-sm shadow-rose-500/5',
      dotClass: 'bg-rose-500',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
      defaultLabel: 'Priority Support Recommended',
      description: 'High attention required (Score: 60 - 100/100). Multi-factor intervention recommended.',
    },
  };

  const activeConfig = configs[computedTier];
  const labelText = badgeLabel || activeConfig.defaultLabel;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs gap-2 font-medium',
    lg: 'px-3.5 py-1.5 text-sm gap-2.5 font-semibold',
  };

  return (
    <div
      onClick={onClick}
      title={activeConfig.description}
      className={`inline-flex items-center rounded-full backdrop-blur-md transition-all duration-200 ${
        activeConfig.badgeClass
      } ${sizeClasses[size]} ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      {activeConfig.icon}
      <span>{labelText}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[10px] opacity-80 bg-black/10 dark:bg-white/10 px-1.5 py-0.2 rounded-full">
          {score}/100
        </span>
      )}
    </div>
  );
}
