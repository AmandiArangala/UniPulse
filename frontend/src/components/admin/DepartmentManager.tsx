'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import { Department, Faculty } from '@/types/catalog';
import {
  getDepartments,
  getFaculties,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/catalog-service';
import { toast } from 'sonner';

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('ALL');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [deptList, facList] = await Promise.all([
        getDepartments({
          searchQuery,
          facultyId: selectedFacultyId !== 'ALL' ? selectedFacultyId : undefined,
        }),
        getFaculties(),
      ]);
      setDepartments(deptList);
      setFaculties(facList);
      if (facList.length > 0 && !facultyId) {
        setFacultyId(facList[0].id);
      }
    } catch (error) {
      toast.error('Failed to load department records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedFacultyId]);

  const handleOpenAddModal = () => {
    setEditingDepartment(null);
    setCode('');
    setName('');
    setHeadOfDepartment('');
    if (faculties.length > 0) setFacultyId(faculties[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setCode(dept.code);
    setName(dept.name);
    setFacultyId(dept.facultyId);
    setHeadOfDepartment(dept.headOfDepartment || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !facultyId) {
      toast.error('Code, Name, and Faculty are required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, {
          code: code.trim(),
          name: name.trim(),
          facultyId,
          headOfDepartment: headOfDepartment.trim(),
        });
        toast.success(`Updated Department: ${name}`);
      } else {
        await createDepartment({
          code: code.trim(),
          name: name.trim(),
          facultyId,
          headOfDepartment: headOfDepartment.trim(),
        });
        toast.success(`Created Department: ${name}`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Are you sure you want to delete Department "${dept.name}" (${dept.code})?`)) return;

    try {
      await deleteDepartment(dept.id);
      toast.success(`Deleted Department ${dept.name}`);
      loadData();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search departments by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            >
              <option value="ALL">All Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} - {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading department catalog...</div>
      ) : departments.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Building className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Departments Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create departments under your institution&apos;s faculties.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs tracking-wider">
                      {dept.code}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {dept.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Department"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                  {dept.name}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Faculty: <strong className="text-slate-700 dark:text-slate-300">{dept.facultyName}</strong>
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Head of Dept (HOD):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {dept.headOfDepartment || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-2.5">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Students</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {dept.studentCount} Enrolled
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Faculty</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {dept.lecturerCount} Lecturers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingDepartment ? 'Edit Department Record' : 'Add New Department'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DCS"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Computer Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Belongs To Faculty
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Eleanor Vance"
                  value={headOfDepartment}
                  onChange={(e) => setHeadOfDepartment(e.target.value)}
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
                  {isSubmitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
