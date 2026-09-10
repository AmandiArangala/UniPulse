'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { AssignedModule, AttendanceSessionDetail, StudentAttendanceRecordItem, SessionType } from '@/types/lecturer';
import { lecturerService } from '@/lib/lecturer-service';
import { AttendanceSessionManager } from '@/components/lecturer/AttendanceSessionManager';
import { toast } from 'sonner';

export default function LecturerAttendancePage() {
  const searchParams = useSearchParams();
  const preselectedModuleId = searchParams.get('module');

  const [modules, setModules] = useState<AssignedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [sessions, setSessions] = useState<AttendanceSessionDetail[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // New Session Form State
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newSessionType, setNewSessionType] = useState<SessionType>('LECTURE');
  const [newSessionDate, setNewSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getAssignedModules();
      setModules(data);
      if (preselectedModuleId && data.some((m) => m.id === preselectedModuleId)) {
        setSelectedModuleId(preselectedModuleId);
      } else if (data.length > 0) {
        setSelectedModuleId(data[0].id);
      }
    } catch {
      toast.error('Failed to load assigned modules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModuleId) {
      loadSessions(selectedModuleId);
    }
  }, [selectedModuleId]);

  const loadSessions = async (modId: string) => {
    setIsLoading(true);
    try {
      const data = await lecturerService.getAttendanceSessions(modId);
      setSessions(data);
      if (data.length > 0) {
        setSelectedSessionId(data[0].id);
      }
    } catch {
      toast.error('Failed to load attendance sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModule = useMemo(() => {
    return modules.find((m) => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const created = await lecturerService.createAttendanceSession({
        moduleId: selectedModuleId,
        moduleCode: selectedModule?.moduleCode,
        moduleName: selectedModule?.moduleTitle,
        sessionDate: newSessionDate,
        sessionType: newSessionType,
        topic: newTopic.trim(),
      });

      setSessions((prev) => [created, ...prev]);
      setSelectedSessionId(created.id);
      setShowNewSessionModal(false);
      setNewTopic('');
      toast.success('New attendance session created!');
    } catch {
      toast.error('Failed to create attendance session');
    }
  };

  const handleSaveRecords = async (sessionId: string, records: StudentAttendanceRecordItem[]) => {
    await lecturerService.recordBulkAttendance(sessionId, records);
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, records } : s))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Lecturer Portal • Session Tracking</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance Sessions & Batch Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule lecture/lab attendance sessions, record attendance, and monitor exam eligibility (80% threshold).
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Module Dropdown */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="py-2.5 px-3.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.moduleCode} - {m.moduleTitle}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowNewSessionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Session</span>
          </button>
        </div>
      </div>

      {/* Sessions Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {sessions.map((s) => {
          const isSelected = s.id === selectedSessionId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSessionId(s.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{s.sessionDate}</span>
              <span className="opacity-75">({s.sessionType})</span>
            </button>
          );
        })}
      </div>

      {/* Active Session Manager */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading attendance session...</p>
        </div>
      ) : activeSession ? (
        <AttendanceSessionManager
          session={activeSession}
          onSaveRecords={handleSaveRecords}
        />
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Sessions Created</h3>
          <p className="text-sm text-slate-500 mt-1">Click "Create Session" to record lecture or lab attendance.</p>
        </div>
      )}

      {/* Create Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Create Attendance Session
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule session for {selectedModule?.moduleCode}
            </p>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Session Topic / Lecture Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Query Optimization & B-Tree Indexes"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={newSessionType}
                    onChange={(e) => setNewSessionType(e.target.value as SessionType)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LECTURE">Lecture</option>
                    <option value="LAB">Lab Practical</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="WORKSHOP">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  Create & Start Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
