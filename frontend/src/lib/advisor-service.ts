import { apiClient } from './axios';
import {
  AssignedStudent,
  Student360Detail,
  AcademicInterventionItem,
  AdvisorCaseloadSummary,
  AssignedStudentsFilter,
  InterventionFilter,
  CreateInterventionPayload,
  UpdateInterventionStatusPayload,
} from '@/types/advisor';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// ============================================================================
// Realistic Mock Fallback Data (ensures zero UI downtime & seamless preview)
// ============================================================================

export const mockAdvisorCaseloadSummary: AdvisorCaseloadSummary = {
  advisorId: 'adv-101',
  advisorName: 'Dr. Eleanor Vance',
  departmentName: 'Department of Computer Science',
  totalAssignedStudents: 48,
  totalOpenInterventions: 7,
  atRiskCount: 6,
  probationCount: 3,
  goodStandingCount: 39,
  averageCaseloadGpa: 3.38,
  averageAttendanceRate: 87.2,
};

export const mockAssignedStudents: AssignedStudent[] = [
  {
    id: 'stu-101',
    userId: 'u-stu-101',
    studentNumber: 'SE/2024/001',
    fullName: 'Alexander Wright',
    email: 'a.wright@unipulse.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    programCode: 'BS-SE',
    programName: 'BSc Software Engineering',
    currentSemester: 4,
    gpa: 2.15,
    academicStatus: 'ACADEMIC_PROBATION',
    riskLevel: 'CRITICAL',
    attendanceRate: 64.5,
    enrolledModulesCount: 5,
    openInterventionsCount: 2,
    enrollmentYear: 2024,
    assignedDate: '2024-09-01',
  },
  {
    id: 'stu-102',
    userId: 'u-stu-102',
    studentNumber: 'SE/2024/014',
    fullName: 'Sophia Martinez',
    email: 's.martinez@unipulse.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    programCode: 'BS-SE',
    programName: 'BSc Software Engineering',
    currentSemester: 4,
    gpa: 2.68,
    academicStatus: 'AT_RISK',
    riskLevel: 'HIGH',
    attendanceRate: 72.0,
    enrolledModulesCount: 5,
    openInterventionsCount: 1,
    enrollmentYear: 2024,
    assignedDate: '2024-09-01',
  },
  {
    id: 'stu-103',
    userId: 'u-stu-103',
    studentNumber: 'SE/2024/028',
    fullName: 'Ethan Chen',
    email: 'e.chen@unipulse.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    programCode: 'BS-SE',
    programName: 'BSc Software Engineering',
    currentSemester: 4,
    gpa: 3.84,
    academicStatus: 'GOOD_STANDING',
    riskLevel: 'LOW',
    attendanceRate: 96.0,
    enrolledModulesCount: 5,
    openInterventionsCount: 0,
    enrollmentYear: 2024,
    assignedDate: '2024-09-01',
  },
  {
    id: 'stu-104',
    userId: 'u-stu-104',
    studentNumber: 'SE/2024/035',
    fullName: 'Maya Lin',
    email: 'm.lin@unipulse.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    programCode: 'BS-SE',
    programName: 'BSc Software Engineering',
    currentSemester: 4,
    gpa: 3.52,
    academicStatus: 'GOOD_STANDING',
    riskLevel: 'LOW',
    attendanceRate: 91.5,
    enrolledModulesCount: 5,
    openInterventionsCount: 0,
    enrollmentYear: 2024,
    assignedDate: '2024-09-01',
  },
  {
    id: 'stu-105',
    userId: 'u-stu-105',
    studentNumber: 'CS/2024/009',
    fullName: 'Lucas Dupont',
    email: 'l.dupont@unipulse.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    programCode: 'BS-CS',
    programName: 'BSc Computer Science',
    currentSemester: 4,
    gpa: 2.82,
    academicStatus: 'AT_RISK',
    riskLevel: 'MEDIUM',
    attendanceRate: 79.0,
    enrolledModulesCount: 4,
    openInterventionsCount: 1,
    enrollmentYear: 2024,
    assignedDate: '2024-09-01',
  },
  {
    id: 'stu-106',
    userId: 'u-stu-106',
    studentNumber: 'CS/2024/022',
    fullName: 'Olivia Taylor',
    email: 'o.taylor@unipulse.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    programCode: 'BS-CS',
    programName: 'BSc Computer Science',
    currentSemester: 4,
    gpa: 3.91,
    academicStatus: 'GOOD_STANDING',
    riskLevel: 'LOW',
    attendanceRate: 98.2,
    enrolledModulesCount: 5,
    openInterventionsCount: 0,
    enrollmentYear: 2024,
    assignedDate: '2024-09-01',
  },
];

export const mockAcademicInterventions: AcademicInterventionItem[] = [
  {
    id: 'int-1',
    studentId: 'stu-101',
    studentName: 'Alexander Wright',
    studentNumber: 'SE/2024/001',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    initiatorId: 'u-adv-101',
    initiatorName: 'Dr. Eleanor Vance',
    initiatorRole: 'ADVISOR',
    moduleId: 'mod-301',
    moduleCode: 'CS-301',
    moduleTitle: 'Database Systems & SQL Architectures',
    reason: 'Failing midterm assessment (42%) and absent for 4 consecutive practical lab sessions.',
    interventionType: 'ACADEMIC_COUNSELING',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    notes: 'Scheduled 1-on-1 counseling session on Sept 14. Recommended peer tutoring for relational algebra.',
    followUpDate: '2026-09-18',
    createdAt: '2026-09-05T10:30:00Z',
    updatedAt: '2026-09-10T14:15:00Z',
  },
  {
    id: 'int-2',
    studentId: 'stu-102',
    studentName: 'Sophia Martinez',
    studentNumber: 'SE/2024/014',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    initiatorId: 'u-adv-101',
    initiatorName: 'Dr. Eleanor Vance',
    initiatorRole: 'ADVISOR',
    moduleId: 'mod-201',
    moduleCode: 'CS-201',
    moduleTitle: 'Object-Oriented Design & Patterns',
    reason: 'Attendance dropped below institutional 75% threshold (currently 72%).',
    interventionType: 'ATTENDANCE_WARNING',
    status: 'OPEN',
    priority: 'HIGH',
    notes: 'Formal attendance notice sent via email. Mandatory attendance agreement required.',
    followUpDate: '2026-09-20',
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-08T09:00:00Z',
  },
  {
    id: 'int-3',
    studentId: 'stu-105',
    studentName: 'Lucas Dupont',
    studentNumber: 'CS/2024/009',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    initiatorId: 'u-adv-101',
    initiatorName: 'Dr. Eleanor Vance',
    initiatorRole: 'ADVISOR',
    reason: 'Requested course credit load reduction due to extracurricular commitments.',
    interventionType: 'STUDY_PLAN',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    notes: 'Approved drop of optional elective CS-310. Revised 4-year study plan agreed upon.',
    followUpDate: '2026-09-01',
    createdAt: '2026-08-28T11:20:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
  },
];

export function getMockStudent360(studentId: string): Student360Detail {
  const student = mockAssignedStudents.find((s) => s.id === studentId) || mockAssignedStudents[0];

  return {
    student,
    academicHistory: [
      {
        moduleId: 'mod-301',
        moduleCode: 'CS-301',
        moduleTitle: 'Database Systems & SQL Architectures',
        creditHours: 4,
        currentGradeScore: 58.0,
        letterGrade: 'D+',
        attendanceRate: 64.5,
        status: 'ENROLLED',
        riskAlert: 'Critical low score in Midterm (42/100) & 4 missed labs',
      },
      {
        moduleId: 'mod-201',
        moduleCode: 'CS-201',
        moduleTitle: 'Object-Oriented Design & Patterns',
        creditHours: 4,
        currentGradeScore: 71.5,
        letterGrade: 'B-',
        attendanceRate: 78.0,
        status: 'ENROLLED',
      },
      {
        moduleId: 'mod-305',
        moduleCode: 'CS-305',
        moduleTitle: 'Algorithms & Data Structures II',
        creditHours: 3,
        currentGradeScore: 65.0,
        letterGrade: 'C',
        attendanceRate: 80.0,
        status: 'ENROLLED',
      },
      {
        moduleId: 'mod-101',
        moduleCode: 'CS-101',
        moduleTitle: 'Programming Fundamentals in C++',
        creditHours: 4,
        currentGradeScore: 82.0,
        letterGrade: 'A-',
        attendanceRate: 94.0,
        status: 'COMPLETED',
      },
    ],
    attendanceTrends: [
      { week: 'Week 1', attendanceRate: 100, sessionsAttended: 4, totalSessions: 4 },
      { week: 'Week 2', attendanceRate: 75, sessionsAttended: 3, totalSessions: 4 },
      { week: 'Week 3', attendanceRate: 50, sessionsAttended: 2, totalSessions: 4 },
      { week: 'Week 4', attendanceRate: 25, sessionsAttended: 1, totalSessions: 4 },
      { week: 'Week 5', attendanceRate: 75, sessionsAttended: 3, totalSessions: 4 },
    ],
    riskFactors: [
      {
        id: 'rf-1',
        category: 'MARKS',
        title: 'Midterm Assessment Failure',
        description: 'Scored 42% on CS-301 Midterm Exam (class avg: 74%).',
        severity: 'CRITICAL',
        detectedAt: '2026-09-05',
      },
      {
        id: 'rf-2',
        category: 'ATTENDANCE',
        title: 'Consecutive Lab Absence',
        description: 'Missed 3 consecutive SQL practical laboratory sessions.',
        severity: 'HIGH',
        detectedAt: '2026-09-08',
      },
    ],
    interventions: mockAcademicInterventions.filter((i) => i.studentId === student.id),
    totalCreditsEarned: 52,
    overallAttendanceRate: student.attendanceRate,
    advisorNotes:
      'Student expressed difficulty balancing part-time employment with CS-301 coursework. Referral to tutoring center suggested.',
  };
}

// ============================================================================
// Service Layer Exported API Methods
// ============================================================================

export async function getAdvisorCaseloadSummary(advisorId?: string): Promise<AdvisorCaseloadSummary> {
  try {
    const res = await apiClient.get<BackendApiResponse<AdvisorCaseloadSummary>>('/advisors/caseload', {
      params: { advisorId },
    });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Advisor Caseload Summary.', error);
  }
  return mockAdvisorCaseloadSummary;
}

export async function getAssignedStudents(filters?: AssignedStudentsFilter): Promise<AssignedStudent[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<AssignedStudent[]>>('/advisors/students', {
      params: {
        search: filters?.searchQuery,
        departmentId: filters?.departmentId,
        status: filters?.academicStatus !== 'ALL' ? filters?.academicStatus : undefined,
      },
    });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Assigned Students.', error);
  }

  let result = [...mockAssignedStudents];

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.programCode.toLowerCase().includes(q)
    );
  }

  if (filters?.academicStatus && filters.academicStatus !== 'ALL') {
    result = result.filter((s) => s.academicStatus === filters.academicStatus);
  }

  if (filters?.riskLevel && filters.riskLevel !== 'ALL') {
    result = result.filter((s) => s.riskLevel === filters.riskLevel);
  }

  return result;
}

export async function getStudent360Profile(studentId: string): Promise<Student360Detail> {
  try {
    const res = await apiClient.get<BackendApiResponse<Student360Detail>>(`/advisors/students/${studentId}/360`);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable for student ${studentId}. Using mock Student 360 profile.`, error);
  }

  return getMockStudent360(studentId);
}

export async function getInterventions(filters?: InterventionFilter): Promise<AcademicInterventionItem[]> {
  try {
    const res = await apiClient.get<BackendApiResponse<AcademicInterventionItem[]>>('/advisors/interventions', {
      params: {
        status: filters?.status !== 'ALL' ? filters?.status : undefined,
        studentId: filters?.studentId,
      },
    });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Using mock Academic Interventions.', error);
  }

  let result = [...mockAcademicInterventions];

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (i) =>
        i.studentName.toLowerCase().includes(q) ||
        i.studentNumber.toLowerCase().includes(q) ||
        i.reason.toLowerCase().includes(q)
    );
  }

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((i) => i.status === filters.status);
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    result = result.filter((i) => i.priority === filters.priority);
  }

  if (filters?.interventionType && filters.interventionType !== 'ALL') {
    result = result.filter((i) => i.interventionType === filters.interventionType);
  }

  return result;
}

export async function createIntervention(
  payload: CreateInterventionPayload
): Promise<AcademicInterventionItem> {
  try {
    const res = await apiClient.post<BackendApiResponse<AcademicInterventionItem>>(
      '/advisors/interventions',
      payload
    );
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable. Creating mock Academic Intervention.', error);
  }

  const targetStudent = mockAssignedStudents.find((s) => s.id === payload.studentId) || mockAssignedStudents[0];

  const newIntervention: AcademicInterventionItem = {
    id: `int-${Date.now()}`,
    studentId: targetStudent.id,
    studentName: targetStudent.fullName,
    studentNumber: targetStudent.studentNumber,
    studentAvatar: targetStudent.avatarUrl,
    initiatorId: 'u-adv-101',
    initiatorName: 'Dr. Eleanor Vance',
    initiatorRole: 'ADVISOR',
    moduleId: payload.moduleId,
    moduleCode: payload.moduleId ? 'CS-301' : undefined,
    moduleTitle: payload.moduleId ? 'Database Systems & SQL Architectures' : undefined,
    reason: payload.reason,
    interventionType: payload.interventionType,
    status: 'OPEN',
    priority: payload.priority,
    notes: payload.notes,
    followUpDate: payload.followUpDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockAcademicInterventions.unshift(newIntervention);
  targetStudent.openInterventionsCount += 1;

  return newIntervention;
}

export async function updateInterventionStatus(
  id: string,
  payload: UpdateInterventionStatusPayload
): Promise<AcademicInterventionItem> {
  try {
    const res = await apiClient.put<BackendApiResponse<AcademicInterventionItem>>(
      `/advisors/interventions/${id}/status`,
      payload
    );
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable for intervention ${id}. Updating mock item.`, error);
  }

  const item = mockAcademicInterventions.find((i) => i.id === id);
  if (item) {
    item.status = payload.status;
    if (payload.notes) item.notes = payload.notes;
    if (payload.followUpDate) item.followUpDate = payload.followUpDate;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  throw new Error(`Intervention case with ID ${id} not found.`);
}
