'use client';

import React, { useState } from 'react';
import { Building2, Building, GraduationCap, Calendar, BookOpenCheck } from 'lucide-react';
import { FacultyManager } from './FacultyManager';
import { DepartmentManager } from './DepartmentManager';
import { ProgramManager } from './ProgramManager';
import { TermManager } from './TermManager';

type CatalogTab = 'faculties' | 'departments' | 'programs' | 'terms';

export function AcademicCatalogTabs() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('faculties');

  const tabs = [
    { id: 'faculties', label: 'Faculties', icon: Building2, count: '3' },
    { id: 'departments', label: 'Departments', icon: Building, count: '4' },
    { id: 'programs', label: 'Degree Programs', icon: GraduationCap, count: '4' },
    { id: 'terms', label: 'Academic Terms', icon: Calendar, count: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpenCheck className="w-4 h-4" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Catalog Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure faculties, departments, degree program offerings, and active academic terms.
          </p>
        </div>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CatalogTab)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Content */}
      <div className="mt-6">
        {activeTab === 'faculties' && <FacultyManager />}
        {activeTab === 'departments' && <DepartmentManager />}
        {activeTab === 'programs' && <ProgramManager />}
        {activeTab === 'terms' && <TermManager />}
      </div>
    </div>
  );
}
