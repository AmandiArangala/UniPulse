'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  BookOpen,
  Calendar,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Filter,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { TimelineEventItem, TimelineCategory, StudentJourneyTimelineData } from '@/types/timeline';
import { studentJourneyService } from '@/lib/student-journey-service';
import { AssignedStudent } from '@/types/advisor';

interface StudentJourneyTimelineProps {
  studentId: string;
  student?: AssignedStudent | null;
  onLogIntervention?: (student: AssignedStudent) => void;
}

export function StudentJourneyTimeline({
  studentId,
  student,
  onLogIntervention,
}: StudentJourneyTimelineProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [timelineData, setTimelineData] = useState<StudentJourneyTimelineData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      studentJourneyService
        .getStudentJourneyTimeline(studentId)
        .then((data) => setTimelineData(data))
        .catch((err) => console.error('Failed to load timeline:', err))
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  const filteredEvents = useMemo(() => {
    if (!timelineData || !timelineData.timelineEvents) return [];
    if (selectedCategory === 'ALL') return timelineData.timelineEvents;
    return timelineData.timelineEvents.filter((ev) => ev.category === selectedCategory);
  }, [timelineData, selectedCategory]);

  const getCategoryIcon = (category: TimelineCategory) => {
    switch (category) {
      case 'INTERVENTION':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'ASSESSMENT':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'ATTENDANCE':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'LEARNING_EVENT':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Critical
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Warning
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Success
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Info
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
        <div className="text-xs font-semibold text-slate-500">
          Loading chronological Student Journey Timeline...
        </div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        No journey timeline data available for this student.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metric Summary */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Clock className="w-4 h-4" />
            <span>Student Academic Lifecycle Timeline</span>
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            {timelineData.studentName} ({timelineData.studentNumber})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chronological aggregation of marks, attendance, portal events, and advisor interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Events</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{timelineData.totalEventsCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Open Cases</span>
            <span className="text-sm font-black text-amber-500">{timelineData.openInterventionsCount}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>

        {(['ALL', 'INTERVENTION', 'ASSESSMENT', 'ATTENDANCE', 'LEARNING_EVENT', 'ENROLLMENT'] as TimelineCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredEvents.map((ev) => {
          const isExpanded = expandedEventId === ev.eventId;
          return (
            <div key={ev.eventId} className="relative group">
              {/* Event Icon Node */}
              <div className="absolute -left-[1.35rem] top-1.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow-md">
                {getCategoryIcon(ev.category)}
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {ev.moduleCode}
                    </span>
                    {getSeverityBadge(ev.severity)}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Source: {ev.initiatorOrSource}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {ev.title}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : ev.eventId)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                      title="Toggle Event Details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Expanded Metadata details */}
                {isExpanded && ev.metadata && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-mono">
                    <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider mb-1">
                      Event Context Payload:
                    </div>
                    {Object.entries(ev.metadata).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-400">{k}:</span>
                        <span className="font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-xs">
            No journey events recorded under selected category filter.
          </div>
        )}
      </div>
    </div>
  );
}
