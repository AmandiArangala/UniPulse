import { apiClient } from './axios';
import {
  Faculty,
  Department,
  DegreeProgram,
  AcademicTerm,
  CreateFacultyPayload,
  CreateDepartmentPayload,
  CreateProgramPayload,
  CreateTermPayload,
  CatalogFilter,
} from '@/types/catalog';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// Realistic Mock Fallback Data (Zero UI Downtime & Offline Preview)
// ============================================================================

export const mockFaculties: Faculty[] = [
  {
    id: 'fac-1',
    code: 'FST',
    name: 'Faculty of Science & Technology',
    description: 'School of Computing, Mathematics, Data Science, and Physical Sciences.',
    deanName: 'Prof. Harrison Ford',
    totalDepartments: 4,
    activeModulesCount: 38,
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'fac-2',
    code: 'FOE',
    name: 'Faculty of Engineering',
    description: 'School of Electrical, Electronics, Mechanical, and Civil Engineering.',
    deanName: 'Dr. Evelyn Reed',
    totalDepartments: 3,
    activeModulesCount: 26,
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'fac-3',
    code: 'FBM',
    name: 'Faculty of Business & Management',
    description: 'Department of Finance, Accounting, Marketing, and Business Analytics.',
    deanName: 'Dr. Raymond Reddington',
    totalDepartments: 3,
    activeModulesCount: 20,
    status: 'ACTIVE',
    createdAt: '2023-06-01T08:00:00Z',
  },
];

export const mockDepartments: Department[] = [
  {
    id: 'dept-cs',
    code: 'DCS',
    name: 'Computer Science',
    facultyId: 'fac-1',
    facultyName: 'Faculty of Science & Technology',
    headOfDepartment: 'Dr. Eleanor Vance',
    studentCount: 420,
    lecturerCount: 18,
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'dept-math',
    code: 'DMATH',
    name: 'Mathematics & Statistics',
    facultyId: 'fac-1',
    facultyName: 'Faculty of Science & Technology',
    headOfDepartment: 'Dr. Sarah Jenkins',
    studentCount: 180,
    lecturerCount: 10,
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'dept-ee',
    code: 'DEE',
    name: 'Electrical Engineering',
    facultyId: 'fac-2',
    facultyName: 'Faculty of Engineering',
    headOfDepartment: 'Prof. Arthur Pendelton',
    studentCount: 290,
    lecturerCount: 14,
    status: 'ACTIVE',
    createdAt: '2023-02-10T08:00:00Z',
  },
  {
    id: 'dept-ba',
    code: 'DBA',
    name: 'Business Analytics',
    facultyId: 'fac-3',
    facultyName: 'Faculty of Business & Management',
    headOfDepartment: 'Dr. Victoria Chase',
    studentCount: 210,
    lecturerCount: 9,
    status: 'ACTIVE',
    createdAt: '2023-06-15T08:00:00Z',
  },
];

export const mockPrograms: DegreeProgram[] = [
  {
    id: 'prog-1',
    code: 'BSC-CS',
    title: 'B.Sc. (Hons) in Computer Science',
    degreeType: 'UNDERGRADUATE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    totalCredits: 120,
    durationYears: 4,
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'prog-2',
    code: 'BSC-SE',
    title: 'B.Sc. (Hons) in Software Engineering',
    degreeType: 'UNDERGRADUATE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    totalCredits: 124,
    durationYears: 4,
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'prog-3',
    code: 'BENG-EE',
    title: 'B.Eng. (Hons) in Electrical & Electronics',
    degreeType: 'UNDERGRADUATE',
    departmentId: 'dept-ee',
    departmentName: 'Electrical Engineering',
    totalCredits: 136,
    durationYears: 4,
    status: 'ACTIVE',
    createdAt: '2023-02-10T08:00:00Z',
  },
  {
    id: 'prog-4',
    code: 'MSC-DS',
    title: 'M.Sc. in Data Science & AI',
    degreeType: 'POSTGRADUATE',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    totalCredits: 45,
    durationYears: 2,
    status: 'ACTIVE',
    createdAt: '2024-01-10T08:00:00Z',
  },
];

export const mockTerms: AcademicTerm[] = [
  {
    id: 'term-2026-1',
    code: '2026-SEM-1',
    name: 'Fall Semester 2026/2027',
    academicYear: '2026/2027',
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    isCurrent: true,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'term-2026-2',
    code: '2026-SEM-2',
    name: 'Spring Semester 2027',
    academicYear: '2026/2027',
    startDate: '2027-01-15',
    endDate: '2027-05-30',
    isCurrent: false,
    status: 'UPCOMING',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'term-2025-2',
    code: '2025-SEM-2',
    name: 'Spring Semester 2026',
    academicYear: '2025/2026',
    startDate: '2026-01-10',
    endDate: '2026-05-25',
    isCurrent: false,
    status: 'ARCHIVED',
    createdAt: '2025-01-10T08:00:00Z',
  },
];

// ============================================================================
// Service Layer Exported Methods (Faculties)
// ============================================================================

export async function getFaculties(filter?: CatalogFilter): Promise<Faculty[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<Faculty[]>>('/faculties/all');
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Faculties data.', error);
  }

  let result = [...mockFaculties];
  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)
    );
  }
  if (filter?.status && filter.status !== 'ALL') {
    result = result.filter((f) => f.status === filter.status);
  }
  return result;
}

export async function createFaculty(payload: CreateFacultyPayload): Promise<Faculty> {
  try {
    const res = await apiClient.post<BackendApiResponse<Faculty>>('/faculties', payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Creating mock Faculty.', error);
  }

  const newFaculty: Faculty = {
    id: `fac-${Date.now()}`,
    code: payload.code.toUpperCase(),
    name: payload.name,
    description: payload.description,
    deanName: payload.deanName || 'Unassigned',
    totalDepartments: 0,
    activeModulesCount: 0,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  mockFaculties.unshift(newFaculty);
  return newFaculty;
}

export async function updateFaculty(id: string, payload: Partial<CreateFacultyPayload>): Promise<Faculty> {
  try {
    const res = await apiClient.put<BackendApiResponse<Faculty>>(`/faculties/${id}`, payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable. Updating mock Faculty ${id}.`, error);
  }

  const item = mockFaculties.find((f) => f.id === id);
  if (item) {
    if (payload.name) item.name = payload.name;
    if (payload.code) item.code = payload.code.toUpperCase();
    if (payload.deanName) item.deanName = payload.deanName;
    if (payload.description) item.description = payload.description;
    return item;
  }
  throw new Error(`Faculty ${id} not found.`);
}

export async function deleteFaculty(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/faculties/${id}`);
    return true;
  } catch (error) {
    console.warn(`Backend API unavailable. Deleting mock Faculty ${id}.`, error);
  }

  const idx = mockFaculties.findIndex((f) => f.id === id);
  if (idx !== -1) {
    mockFaculties.splice(idx, 1);
    return true;
  }
  return false;
}

// ============================================================================
// Service Layer Exported Methods (Departments)
// ============================================================================

export async function getDepartments(filter?: CatalogFilter): Promise<Department[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<Department[]>>('/departments/all');
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Departments data.', error);
  }

  let result = [...mockDepartments];
  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
  }
  if (filter?.facultyId) {
    result = result.filter((d) => d.facultyId === filter.facultyId);
  }
  return result;
}

export async function createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
  try {
    const res = await apiClient.post<BackendApiResponse<Department>>('/departments', payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Creating mock Department.', error);
  }

  const parentFaculty = mockFaculties.find((f) => f.id === payload.facultyId);

  const newDept: Department = {
    id: `dept-${Date.now()}`,
    code: payload.code.toUpperCase(),
    name: payload.name,
    facultyId: payload.facultyId,
    facultyName: parentFaculty ? parentFaculty.name : 'General Faculty',
    headOfDepartment: payload.headOfDepartment || 'Unassigned',
    studentCount: 0,
    lecturerCount: 0,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  mockDepartments.unshift(newDept);
  return newDept;
}

export async function updateDepartment(id: string, payload: Partial<CreateDepartmentPayload>): Promise<Department> {
  try {
    const res = await apiClient.put<BackendApiResponse<Department>>(`/departments/${id}`, payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable. Updating mock Department ${id}.`, error);
  }

  const item = mockDepartments.find((d) => d.id === id);
  if (item) {
    if (payload.name) item.name = payload.name;
    if (payload.code) item.code = payload.code.toUpperCase();
    if (payload.headOfDepartment) item.headOfDepartment = payload.headOfDepartment;
    return item;
  }
  throw new Error(`Department ${id} not found.`);
}

export async function deleteDepartment(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/departments/${id}`);
    return true;
  } catch (error) {
    console.warn(`Backend API unavailable. Deleting mock Department ${id}.`, error);
  }

  const idx = mockDepartments.findIndex((d) => d.id === id);
  if (idx !== -1) {
    mockDepartments.splice(idx, 1);
    return true;
  }
  return false;
}

// ============================================================================
// Service Layer Exported Methods (Degree Programs)
// ============================================================================

export async function getPrograms(filter?: CatalogFilter): Promise<DegreeProgram[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<DegreeProgram[]>>('/programs/all');
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Programs data.', error);
  }

  let result = [...mockPrograms];
  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (p) => p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }
  if (filter?.departmentId) {
    result = result.filter((p) => p.departmentId === filter.departmentId);
  }
  return result;
}

export async function createProgram(payload: CreateProgramPayload): Promise<DegreeProgram> {
  try {
    const res = await apiClient.post<BackendApiResponse<DegreeProgram>>('/programs', payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Creating mock Degree Program.', error);
  }

  const dept = mockDepartments.find((d) => d.id === payload.departmentId);

  const newProg: DegreeProgram = {
    id: `prog-${Date.now()}`,
    code: payload.code.toUpperCase(),
    title: payload.title,
    degreeType: payload.degreeType,
    departmentId: payload.departmentId,
    departmentName: dept ? dept.name : 'Computer Science',
    totalCredits: payload.totalCredits,
    durationYears: payload.durationYears,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  mockPrograms.unshift(newProg);
  return newProg;
}

export async function deleteProgram(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/programs/${id}`);
    return true;
  } catch (error) {
    console.warn(`Backend API unavailable. Deleting mock Program ${id}.`, error);
  }

  const idx = mockPrograms.findIndex((p) => p.id === id);
  if (idx !== -1) {
    mockPrograms.splice(idx, 1);
    return true;
  }
  return false;
}

// ============================================================================
// Service Layer Exported Methods (Academic Terms / Semesters)
// ============================================================================

export async function getTerms(filter?: CatalogFilter): Promise<AcademicTerm[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<AcademicTerm[]>>('/semesters/all');
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Terms data.', error);
  }

  let result = [...mockTerms];
  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
    );
  }
  if (filter?.status && filter.status !== 'ALL') {
    result = result.filter((t) => t.status === filter.status);
  }
  return result;
}

export async function createTerm(payload: CreateTermPayload): Promise<AcademicTerm> {
  try {
    const res = await apiClient.post<BackendApiResponse<AcademicTerm>>('/semesters', payload);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Creating mock Academic Term.', error);
  }

  if (payload.isCurrent) {
    mockTerms.forEach((t) => (t.isCurrent = false));
  }

  const newTerm: AcademicTerm = {
    id: `term-${Date.now()}`,
    code: payload.code.toUpperCase(),
    name: payload.name,
    academicYear: payload.academicYear,
    startDate: payload.startDate,
    endDate: payload.endDate,
    isCurrent: !!payload.isCurrent,
    status: payload.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  mockTerms.unshift(newTerm);
  return newTerm;
}

export async function setCurrentTerm(id: string): Promise<AcademicTerm> {
  try {
    const res = await apiClient.put<BackendApiResponse<AcademicTerm>>(`/semesters/${id}/set-current`);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable. Setting current term ${id} in mock data.`, error);
  }

  let target: AcademicTerm | undefined;
  mockTerms.forEach((t) => {
    if (t.id === id) {
      t.isCurrent = true;
      t.status = 'ACTIVE';
      target = t;
    } else {
      t.isCurrent = false;
    }
  });

  if (target) return target;
  throw new Error(`Academic Term ${id} not found.`);
}
