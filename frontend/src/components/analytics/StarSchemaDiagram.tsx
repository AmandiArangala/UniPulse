'use client';

import React, { useState } from 'react';
import { StarSchemaRelationship } from '@/types/powerbi';
import {
  Database,
  ArrowRight,
  Shield,
  Layers,
  Table,
  CheckCircle2,
  Filter,
  Eye,
  Key,
  Calendar,
  BookOpen,
  GraduationCap,
  Users,
} from 'lucide-react';

interface StarSchemaDiagramProps {
  relationships: StarSchemaRelationship[];
  factTableName?: string;
  dimensionTables?: string[];
  totalFactRecords?: number;
}

export const StarSchemaDiagram: React.FC<StarSchemaDiagramProps> = ({
  relationships,
  factTableName = 'fact_performance',
  dimensionTables = ['dim_student', 'dim_module', 'dim_semester', 'dim_program', 'dim_date'],
  totalFactRecords = 1250,
}) => {
  const [activeTable, setActiveTable] = useState<string | null>(factTableName);

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'dim_student':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'dim_module':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'dim_semester':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'dim_program':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'dim_date':
        return <Calendar className="w-4 h-4 text-rose-400" />;
      default:
        return <Database className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTableDetails = (tableName: string) => {
    switch (tableName) {
      case 'fact_performance':
        return {
          type: 'Central Fact Table',
          grain: '1 row per student per module per semester',
          primaryKey: 'fact_id (UUID)',
          foreignKeys: ['student_key', 'module_key', 'semester_key', 'program_key', 'date_key'],
          measures: ['scores', 'attendance_rate', 'submission_rate', 'health_score'],
          records: totalFactRecords.toLocaleString(),
        };
      case 'dim_student':
        return {
          type: 'Conformed Dimension',
          grain: '1 row per enrolled student',
          primaryKey: 'student_key (UUID)',
          foreignKeys: [],
          attributes: ['student_number', 'full_name', 'current_gpa', 'academic_status'],
          records: '250 Students',
        };
      case 'dim_module':
        return {
          type: 'Conformed Dimension',
          grain: '1 row per active course module',
          primaryKey: 'module_key (UUID)',
          foreignKeys: [],
          attributes: ['module_code', 'module_title', 'credit_hours', 'department_name'],
          records: '45 Modules',
        };
      case 'dim_semester':
        return {
          type: 'Temporal Dimension',
          grain: '1 row per academic term',
          primaryKey: 'semester_key (UUID)',
          foreignKeys: [],
          attributes: ['semester_name', 'academic_year', 'start_date', 'end_date'],
          records: '8 Semesters',
        };
      case 'dim_program':
        return {
          type: 'Organizational Dimension',
          grain: '1 row per degree program',
          primaryKey: 'program_key (UUID)',
          foreignKeys: [],
          attributes: ['program_code', 'program_name', 'degree_level', 'faculty_name'],
          records: '12 Programs',
        };
      case 'dim_date':
        return {
          type: 'Calendar Dimension',
          grain: '1 row per date entry',
          primaryKey: 'date_key (DATE)',
          foreignKeys: [],
          attributes: ['year', 'quarter', 'month_name', 'academic_week'],
          records: '365 Days',
        };
      default:
        return {
          type: 'Dimension Table',
          grain: 'Lookup entity',
          primaryKey: 'key',
          foreignKeys: [],
          attributes: [],
          records: 'N/A',
        };
    }
  };

  const selectedDetails = activeTable ? getTableDetails(activeTable) : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-slate-100">Star Schema Visual ERD</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Single-directional ($1 : *$) filter flow from Dimension Tables into Central Performance Fact Table
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
            1-to-Many Relationships
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Single Filter Direction
          </span>
        </div>
      </div>

      {/* Visual Diagram Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-6">
        {/* Dimensions Left Column */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Dimension Entities (1)
          </span>
          {dimensionTables.slice(0, 3).map((tableName) => {
            const rel = relationships.find((r) => r.fromTable === tableName);
            const isSelected = activeTable === tableName;
            return (
              <div
                key={tableName}
                onClick={() => setActiveTable(tableName)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {getTableIcon(tableName)}
                  <span className="text-sm font-semibold font-mono">{tableName}</span>
                </div>
                {rel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    1 : *
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Central Fact Node Column */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-950 border-2 border-blue-500/40 shadow-xl shadow-blue-500/10 text-center relative">
          <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-blue-500 text-slate-950 font-bold text-[10px] tracking-widest uppercase">
            Central Fact Engine
          </div>

          <div
            onClick={() => setActiveTable(factTableName)}
            className={`w-full p-5 rounded-xl border transition-all cursor-pointer ${
              activeTable === factTableName
                ? 'bg-blue-600/20 border-blue-400 text-white ring-2 ring-blue-400/30'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-blue-500'
            }`}
          >
            <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-base font-extrabold font-mono text-blue-300">{factTableName}</h4>
            <p className="text-xs text-slate-400 mt-1">{totalFactRecords.toLocaleString()} Fact Records</p>
          </div>
        </div>

        {/* Dimensions Right Column */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Dimension Entities (2)
          </span>
          {dimensionTables.slice(3).map((tableName) => {
            const rel = relationships.find((r) => r.fromTable === tableName);
            const isSelected = activeTable === tableName;
            return (
              <div
                key={tableName}
                onClick={() => setActiveTable(tableName)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {getTableIcon(tableName)}
                  <span className="text-sm font-semibold font-mono">{tableName}</span>
                </div>
                {rel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    1 : *
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Table Metadata Drawer */}
      {selectedDetails && (
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-200 font-mono">{activeTable}</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                {selectedDetails.type}
              </span>
            </div>
            <span className="text-slate-400 font-mono">Volume: {selectedDetails.records}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-slate-300">
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Primary Key:</span>
              <code className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                {selectedDetails.primaryKey}
              </code>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Grain Definition:</span>
              <span>{selectedDetails.grain}</span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Filter Direction:</span>
              <span className="text-amber-400 font-mono">Single Directional (1 $\rightarrow$ *)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
