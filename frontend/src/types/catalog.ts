/**
 * UniPulse Academic Catalog Management Data Types
 * Phase 3: Frontend Portals - Day 15 (Administrator Portal)
 */

export type CatalogItemStatus = 'ACTIVE' | 'INACTIVE';
export type DegreeLevel = 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORATE' | 'DIPLOMA';
export type TermStatus = 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';

export interface Faculty {
  id: string;
  code: string; // e.g. "FST"
  name: string; // e.g. "Faculty of Science & Technology"
  description?: string;
  deanName?: string;
  totalDepartments: number;
  activeModulesCount: number;
  status: CatalogItemStatus;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string; // e.g. "DCS"
  name: string; // e.g. "Department of Computer Science"
  facultyId: string;
  facultyName: string;
  headOfDepartment?: string;
  studentCount: number;
  lecturerCount: number;
  status: CatalogItemStatus;
  createdAt: string;
}

export interface DegreeProgram {
  id: string;
  code: string; // e.g. "BSC-CS"
  title: string; // e.g. "B.Sc. (Hons) in Computer Science"
  degreeType: DegreeLevel;
  departmentId: string;
  departmentName: string;
  totalCredits: number;
  durationYears: number;
  status: CatalogItemStatus;
  createdAt: string;
}

export interface AcademicTerm {
  id: string;
  code: string; // e.g. "2026-SEM-1"
  name: string; // e.g. "Semester 1, 2026/2027"
  academicYear: string; // e.g. "2026/2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: TermStatus;
  createdAt: string;
}

export interface CreateFacultyPayload {
  code: string;
  name: string;
  description?: string;
  deanName?: string;
}

export interface CreateDepartmentPayload {
  code: string;
  name: string;
  facultyId: string;
  headOfDepartment?: string;
}

export interface CreateProgramPayload {
  code: string;
  title: string;
  degreeType: DegreeLevel;
  departmentId: string;
  totalCredits: number;
  durationYears: number;
}

export interface CreateTermPayload {
  code: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  status?: TermStatus;
}

export interface CatalogFilter {
  searchQuery?: string;
  status?: 'ALL' | CatalogItemStatus | TermStatus;
  facultyId?: string;
  departmentId?: string;
}
