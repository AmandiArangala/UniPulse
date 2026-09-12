/**
 * UniPulse Advisor Portal Data Types & Structures
 * Phase 3: Frontend Portals - Day 14
 */

export type AcademicStatus =
  | 'GOOD_STANDING'
  | 'ACADEMIC_PROBATION'
  | 'AT_RISK'
  | 'CRITICAL'
  | 'WITHDRAWN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InterventionType =
  | 'ACADEMIC_COUNSELING'
  | 'TUTORING_REFERRAL'
  | 'ATTENDANCE_WARNING'
  | 'PROBATION_NOTICE'
  | 'MENTAL_HEALTH_REFERRAL'
  | 'STUDY_PLAN'
  | 'CREDIT_ADJUSTMENT';

export type InterventionStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type InterventionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AssignedStudent {
  id: string;
  userId: string;
  studentNumber: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  departmentId: string;
  departmentName: string;
  programCode: string;
  programName: string;
  currentSemester: number;
  gpa: number;
  academicStatus: AcademicStatus;
  riskLevel: RiskLevel;
  attendanceRate: number;
  enrolledModulesCount: number;
  openInterventionsCount: number;
  enrollmentYear: number;
  assignedDate: string;
}

export interface StudentModuleGradeSummary {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  creditHours: number;
  currentGradeScore?: number;
  letterGrade?: string;
  attendanceRate: number;
  status: 'ENROLLED' | 'COMPLETED' | 'WITHDRAWN' | 'FAILED';
  riskAlert?: string;
}

export interface StudentAttendanceTrendPoint {
  week: string;
  attendanceRate: number;
  sessionsAttended: number;
  totalSessions: number;
}

export interface StudentRiskFactor {
  id: string;
  category: 'ATTENDANCE' | 'MARKS' | 'DEADLINE' | 'PREREQUISITE';
  title: string;
  description: string;
  severity: RiskLevel;
  detectedAt: string;
}

export interface AcademicInterventionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  studentAvatar?: string;
  initiatorId: string;
  initiatorName: string;
  initiatorRole: string;
  moduleId?: string;
  moduleCode?: string;
  moduleTitle?: string;
  reason: string;
  interventionType: InterventionType;
  status: InterventionStatus;
  priority: InterventionPriority;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student360Detail {
  student: AssignedStudent;
  academicHistory: StudentModuleGradeSummary[];
  attendanceTrends: StudentAttendanceTrendPoint[];
  riskFactors: StudentRiskFactor[];
  interventions: AcademicInterventionItem[];
  totalCreditsEarned: number;
  overallAttendanceRate: number;
  advisorNotes?: string;
}

export interface AdvisorCaseloadSummary {
  advisorId: string;
  advisorName: string;
  departmentName: string;
  totalAssignedStudents: number;
  totalOpenInterventions: number;
  atRiskCount: number;
  probationCount: number;
  goodStandingCount: number;
  averageCaseloadGpa: number;
  averageAttendanceRate: number;
}

export interface AssignedStudentsFilter {
  searchQuery?: string;
  departmentId?: string;
  academicStatus?: AcademicStatus | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
}

export interface InterventionFilter {
  searchQuery?: string;
  status?: InterventionStatus | 'ALL';
  priority?: InterventionPriority | 'ALL';
  interventionType?: InterventionType | 'ALL';
  studentId?: string;
}

export interface CreateInterventionPayload {
  studentId: string;
  moduleId?: string;
  interventionType: InterventionType;
  priority: InterventionPriority;
  reason: string;
  followUpDate?: string;
  notes?: string;
}

export interface UpdateInterventionStatusPayload {
  status: InterventionStatus;
  notes?: string;
  followUpDate?: string;
}
