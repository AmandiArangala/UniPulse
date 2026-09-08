import { RiskLevel } from './auth';

export type AcademicStatus = 'GOOD_STANDING' | 'PROBATION' | 'CRITICAL' | 'SUSPENDED';

export type AcademicDegreeClass =
  | 'FIRST_CLASS'
  | 'SECOND_UPPER'
  | 'SECOND_LOWER'
  | 'GENERAL_PASS'
  | 'FAIL';

export type AssessmentType =
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'MIDTERM_EXAM'
  | 'FINAL_EXAM'
  | 'PROJECT'
  | 'LAB_PRACTICAL'
  | 'PRESENTATION';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type EnrollmentStatus = 'ENROLLED' | 'DROPPED' | 'WITHDRAWN' | 'COMPLETED';

export interface AssessmentScoreBreakdown {
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  weightPercentage: number;
  maxScore: number;
  scoreObtained?: number | null;
  percentageScore?: number | null;
  weightedContribution?: number | null;
  isPublished?: boolean;
  dueDate?: string;
}

export interface ModuleGradeSummary {
  enrollmentId: string;
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  creditHours: number;
  isGpa: boolean;
  caWeightPercentage: number;
  weWeightPercentage: number;
  caScoreObtained?: number;
  weScoreObtained?: number;
  finalGrade?: number;
  letterGrade?: string;
  gradePoint?: number;
  meetsComponentThreshold?: boolean;
  assessmentBreakdowns: AssessmentScoreBreakdown[];
  lecturerName?: string;
  enrollmentStatus?: EnrollmentStatus;
}

export interface SemesterGpaReport {
  semesterId: string;
  semesterName: string;
  academicYear: number;
  sgpa: number;
  semesterGpaCredits: number;
  semesterNgpaCredits: number;
  modules: ModuleGradeSummary[];
}

export interface StudentGpaSummary {
  studentId: string;
  studentNumber: string;
  studentName: string;
  programName: string;
  currentSemester: number;
  cgpa: number;
  academicStatus: AcademicStatus;
  academicDegreeClass: AcademicDegreeClass;
  totalEarnedGpaCredits: number;
  totalEarnedNgpaCredits: number;
  semesterReports: SemesterGpaReport[];
}

export interface DegreeClassTarget {
  degreeClass: AcademicDegreeClass;
  targetCgpa: number;
  requiredRemainingGpa: number;
  isAttainable: boolean;
  description: string;
}

export interface TargetGpaProjection {
  studentId: string;
  currentCgpa: number;
  currentEarnedCredits: number;
  totalDegreeCredits: number;
  remainingCredits: number;
  targets: DegreeClassTarget[];
  trajectorySummary: string;
}

export interface AssessmentWeightSummary {
  moduleId: string;
  moduleCode: string;
  semesterId: string;
  totalCaWeightPercentage: number;
  totalWeWeightPercentage: number;
  totalWeightPercentage: number;
  isWeightValid: boolean;
  isPublished: boolean;
  assessments: {
    id: string;
    title: string;
    type: AssessmentType;
    weightPercentage: number;
    maxScore: number;
    isPublished: boolean;
  }[];
}

export interface AttendanceRecordResponse {
  id: string;
  sessionId: string;
  studentId: string;
  studentRegistrationNumber: string;
  studentName: string;
  status: AttendanceStatus;
  remarks?: string;
  sessionDate?: string;
  moduleCode?: string;
  moduleName?: string;
  topic?: string;
}

export interface AttendanceSessionResponse {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  lecturerId: string;
  lecturerName: string;
  sessionDate: string;
  topic: string;
  totalRecords: number;
}

export interface AttendanceSummary {
  studentId: string;
  studentRegistrationNumber: string;
  studentName: string;
  moduleId: string;
  moduleCode: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  eligibleForExam: boolean;
  statusMessage: string;
}

export interface StudentProgramDetails {
  id: string;
  studentNumber: string;
  studentName: string;
  programCode: string;
  programName: string;
  departmentName: string;
  facultyName: string;
  currentSemester: number;
  enrollmentYear: number;
  academicStatus: AcademicStatus;
  totalCredits: number;
  cgpa: number;
}

export interface OverallAttendanceAnalytics {
  overallPercentage: number;
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  lateSessions: number;
  excusedSessions: number;
  eligibleForExam: boolean;
  riskLevel: RiskLevel;
  moduleSummaries: AttendanceSummary[];
}
