'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Users,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { Faculty, CreateFacultyPayload } from '@/types/catalog';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '@/lib/catalog-service';
import { toast } from 'sonner';

export function FacultyManager() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [deanName, setDeanName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getFaculties({ searchQuery });
      setFaculties(data);
    } catch (error) {
      toast.error('Failed to load faculties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setEditingFaculty(null);
    setCode('');
    setName('');
    setDeanName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setCode(fac.code);
    setName(fac.name);
    setDeanName(fac.deanName || '');
    setDescription(fac.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error('Faculty Code and Name are required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, {
          code: code.trim(),
          name: name.trim(),
          deanName: deanName.trim(),
          description: description.trim(),
        });
        toast.success(`Updated Faculty: ${name}`);
      } else {
        await createFaculty({
          code: code.trim(),
          name: name.trim(),
          deanName: deanName.trim(),
          description: description.trim(),
        });
        toast.success(`Created Faculty: ${name}`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save faculty record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (fac: Faculty) => {
    if (!confirm(`Are you sure you want to delete Faculty "${fac.name}" (${fac.code})?`)) return;

    try {
      await deleteFaculty(fac.id);
      toast.success(`Deleted Faculty ${fac.name}`);
      loadData();
    } catch (error) {
      toast.error('Failed to delete faculty');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search faculties by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Faculty</span>
        </button>
      </div>

      {/* Grid of Faculty Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading catalog faculties...</div>
      ) : faculties.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Faculties Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Get started by adding your institution&apos;s first academic faculty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((fac) => (
            <div
              key={fac.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs tracking-wider">
                      {fac.code}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {fac.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(fac)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Faculty"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fac)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                  {fac.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {fac.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-500">Dean of Faculty:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {fac.deanName || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-2.5">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Depts</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {fac.totalDepartments} Departments
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Modules</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {fac.activeModulesCount} Modules
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingFaculty ? 'Edit Faculty Record' : 'Add New Academic Faculty'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FST"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty of Science & Technology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Dean of Faculty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Harrison Ford"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of departments and disciplines covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
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
                  {isSubmitting ? 'Saving...' : 'Save Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
