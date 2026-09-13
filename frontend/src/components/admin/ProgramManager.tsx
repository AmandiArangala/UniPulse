'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  CheckCircle2,
  X,
  Award,
} from 'lucide-react';
import { DegreeProgram, Department, DegreeLevel } from '@/types/catalog';
import { getPrograms, getDepartments, createProgram, deleteProgram } from '@/lib/catalog-service';
import { toast } from 'sonner';

export function ProgramManager() {
  const [programs, setPrograms] = useState<DegreeProgram[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [degreeType, setDegreeType] = useState<DegreeLevel>('UNDERGRADUATE');
  const [departmentId, setDepartmentId] = useState('');
  const [totalCredits, setTotalCredits] = useState(120);
  const [durationYears, setDurationYears] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [progList, deptList] = await Promise.all([
        getPrograms({
          searchQuery,
          departmentId: selectedDeptId !== 'ALL' ? selectedDeptId : undefined,
        }),
        getDepartments(),
      ]);
      setPrograms(progList);
      setDepartments(deptList);
      if (deptList.length > 0 && !departmentId) {
        setDepartmentId(deptList[0].id);
      }
    } catch (error) {
      toast.error('Failed to load degree programs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedDeptId]);

  const handleOpenAddModal = () => {
    setCode('');
    setTitle('');
    setDegreeType('UNDERGRADUATE');
    setTotalCredits(120);
    setDurationYears(4);
    if (departments.length > 0) setDepartmentId(departments[0].id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim() || !departmentId) {
      toast.error('Code, Title, and Department are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createProgram({
        code: code.trim(),
        title: title.trim(),
        degreeType,
        departmentId,
        totalCredits: Number(totalCredits),
        durationYears: Number(durationYears),
      });
      toast.success(`Degree Program ${title} created successfully`);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create degree program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prog: DegreeProgram) => {
    if (!confirm(`Are you sure you want to delete Degree Program "${prog.title}" (${prog.code})?`)) return;

    try {
      await deleteProgram(prog.id);
      toast.success(`Deleted Program ${prog.code}`);
      loadData();
    } catch (error) {
      toast.error('Failed to delete program');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search programs by code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Degree Program</span>
        </button>
      </div>

      {/* Grid of Programs */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading degree programs...</div>
      ) : programs.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Degree Programs Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add undergraduate or postgraduate degree offerings to the academic catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs tracking-wider">
                      {prog.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {prog.degreeType}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(prog)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                  {prog.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Department: <strong className="text-slate-700 dark:text-slate-300">{prog.departmentName}</strong>
                </p>
              </div>

              {/* Stats Footer */}
              <div className="mt-5 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Credits</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {prog.totalCredits} Credits
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {prog.durationYears} Years
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-white">Add New Degree Program</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Program Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSC-CS"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Program Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc. (Hons) in Computer Science"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Degree Level
                  </label>
                  <select
                    value={degreeType}
                    onChange={(e) => setDegreeType(e.target.value as DegreeLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="UNDERGRADUATE">Undergraduate</option>
                    <option value="POSTGRADUATE">Postgraduate</option>
                    <option value="DOCTORATE">Doctorate</option>
                    <option value="DIPLOMA">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Total Credits
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={240}
                    value={totalCredits}
                    onChange={(e) => setTotalCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md"
                >
                  {isSubmitting ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
