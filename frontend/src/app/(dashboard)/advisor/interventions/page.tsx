'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  X,
  MessageSquare,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import {
  AcademicInterventionItem,
  InterventionStatus,
  InterventionPriority,
  InterventionType,
  AssignedStudent,
} from '@/types/advisor';
import {
  getInterventions,
  updateInterventionStatus,
  getAssignedStudents,
} from '@/lib/advisor-service';
import { AcademicInterventionModal } from '@/components/advisor/AcademicInterventionModal';
import { toast } from 'sonner';

export default function AcademicInterventionsPage() {
  const [interventions, setInterventions] = useState<AcademicInterventionItem[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<InterventionStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<InterventionPriority | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<InterventionType | 'ALL'>('ALL');

  // Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AcademicInterventionItem | null>(null);
  const [newStatus, setNewStatus] = useState<InterventionStatus>('OPEN');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [intData, stuData] = await Promise.all([
        getInterventions(),
        getAssignedStudents(),
      ]);
      setInterventions(intData);
      setAssignedStudents(stuData);
    } catch (err) {
      console.error('Failed to load interventions data:', err);
      toast.error('Failed to load academic interventions list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered List
  const filteredInterventions = useMemo(() => {
    let result = [...interventions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.studentName.toLowerCase().includes(q) ||
          i.studentNumber.toLowerCase().includes(q) ||
          i.reason.toLowerCase().includes(q) ||
          (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((i) => i.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter((i) => i.priority === priorityFilter);
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((i) => i.interventionType === typeFilter);
    }

    return result;
  }, [interventions, searchQuery, statusFilter, priorityFilter, typeFilter]);

  // KPI Calculations
  const totalCases = interventions.length;
  const activeCases = interventions.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
  const criticalCases = interventions.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH').length;
  const resolvedCases = interventions.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setTypeFilter('ALL');
  };

  const handleOpenStatusUpdateModal = (item: AcademicInterventionItem) => {
    setEditingItem(item);
    setNewStatus(item.status);
    setUpdateNotes(item.notes || '');
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      await updateInterventionStatus(editingItem.id, {
        status: newStatus,
        notes: updateNotes.trim() || undefined,
      });

      toast.success(`Intervention case status updated to ${newStatus.replace('_', ' ')}!`);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update intervention case status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            RESOLVED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            CLOSED
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: InterventionPriority) => {
    switch (priority) {
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            LOW PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            MEDIUM PRIORITY
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            HIGH PRIORITY
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            CRITICAL
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Advisor Portal Workspace
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-300 font-medium">Support Workflow Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Academic Support Interventions
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Track student support cases, log early warnings, manage resolution statuses, and schedule follow-ups.
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95 self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Intervention</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total Logged Cases</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalCases}
          </div>
          <div className="text-xs text-slate-500">Cumulative case count</div>
        </div>

        {/* Card 2: Active Cases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Active / Open Cases</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
            {activeCases}
          </div>
          <div className="text-xs text-slate-500">Pending advisor follow-up</div>
        </div>

        {/* Card 3: Critical Priority Cases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Critical & High Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            {criticalCases}
          </div>
          <div className="text-xs text-slate-500">Urgent intervention required</div>
        </div>

        {/* Card 4: Resolved Cases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Resolved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {resolvedCases}
          </div>
          <div className="text-xs text-slate-500">Successfully closed support cases</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, ID, or case reason..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InterventionStatus | 'ALL')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Case Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as InterventionPriority | 'ALL')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="CRITICAL">Critical Priority</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Case Cards List */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-600">Loading intervention cases...</div>
          </div>
        ) : filteredInterventions.length > 0 ? (
          <div className="space-y-4 pt-2">
            {filteredInterventions.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all space-y-3"
              >
                {/* Case Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {item.studentAvatar ? (
                      <img
                        src={item.studentAvatar}
                        alt={item.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                        {item.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/advisor/students/${item.studentId}`}
                        className="font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 text-sm flex items-center gap-1 transition-colors"
                      >
                        {item.studentName}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <div className="text-xs text-slate-500 font-mono">{item.studentNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {item.interventionType.replace('_', ' ')}
                    </span>
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Case Details */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                    Primary Trigger: <span className="font-normal text-slate-700 dark:text-slate-300">{item.reason}</span>
                  </div>

                  {item.moduleCode && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Target Module:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">
                        {item.moduleCode} - {item.moduleTitle}
                      </span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic">
                      "{item.notes}"
                    </div>
                  )}
                </div>

                {/* Footer Info & Workflow Status Update Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>
                      Initiator: <strong>{item.initiatorName}</strong> ({item.initiatorRole})
                    </span>
                    <span>&bull;</span>
                    <span>Logged: {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.followUpDate && (
                      <>
                        <span>&bull;</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Follow-up: {item.followUpDate}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenStatusUpdateModal(item)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Case Status</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No support intervention cases found
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No support cases matched your active search query or selected priority/status filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Update Case Status Modal Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Update Case Status & Notes
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Student: <strong>{editingItem.studentName}</strong> ({editingItem.studentNumber})
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-500">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as InterventionStatus)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="OPEN">OPEN (Pending Action)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Counseling Scheduled)</option>
                  <option value="RESOLVED">RESOLVED (Requirements Completed)</option>
                  <option value="CLOSED">CLOSED (Case Terminated)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-500">
                  Resolution Notes / Progress Update
                </label>
                <textarea
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Completed peer tutoring signup. Attendance restored..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                >
                  {isUpdating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log New Intervention Modal */}
      <AcademicInterventionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        assignedStudents={assignedStudents}
        onSuccess={() => {
          toast.success('New academic support case logged!');
          loadData();
        }}
      />
    </div>
  );
}
