import { AssessmentType, AttendanceStatus, EnrollmentStatus } from './student';
import { RiskLevel } from './auth';

export interface AssignedModule {
  id: string;
  moduleCode: string;
  moduleTitle: string;
  creditHours: number;
  semesterId: string;
  semesterName: string;
  academicYear: number;
  totalEnrolledStudents: number;
  passRatePercentage: number;
  averageGradeScore: number;
  averageGradeLetter: string;
  caWeightPercentage: number;
  weWeightPercentage: number;
  isWeightValid: boolean;
  isPublished: boolean;
}

export interface EnrolledStudentRosterItem {
  studentId: string;
  studentNumber: string;
  studentName: string;
  email: string;
  programCode: string;
  programName: string;
  enrollmentStatus: EnrollmentStatus;
  attendancePercentage: number;
  caCurrentScore: number;
  caMaxScore: number;
  projectedGradeLetter: string;
  riskLevel: RiskLevel;
  lastAttendedDate?: string;
}

export interface HistogramBucket {
  rangeLabel: string;
  minScore: number;
  maxScore: number;
  studentCount: number;
}

export interface GradeDistributionData {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  totalStudents: number;
  averageScore: number;
  medianScore: number;
  maxScore: number;
  minScore: number;
  passRatePercentage: number;
  letterCounts: Record<string, number>;
  histogramBuckets: HistogramBucket[];
}

export interface AssessmentTopicTag {
  id: string;
  topicName: string;
  category?: string;
}

export interface AssessmentAuthoringItem {
  id: string;
  moduleId: string;
  semesterId: string;
  title: string;
  type: AssessmentType;
  weightPercentage: number;
  maxScore: number;
  isPublished: boolean;
  dueDate: string;
  topics: AssessmentTopicTag[];
  description?: string;
}

export interface AssessmentWeightAllocationSummary {
  moduleId: string;
  moduleCode: string;
  semesterId: string;
  totalCaWeight: number;
  totalWeWeight: number;
  totalWeight: number;
  isWeightValid: boolean;
  isPublished: boolean;
  assessments: AssessmentAuthoringItem[];
  validationErrors: string[];
  warnings: string[];
}

export interface MarksEntryCell {
  studentId: string;
  assessmentId: string;
  scoreObtained: number | null;
  maxScore: number;
  isModified?: boolean;
  isSaved?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export interface MarksEntryRow {
  studentId: string;
  studentNumber: string;
  studentName: string;
  email: string;
  programCode: string;
  marks: Record<string, number | null>; // assessmentId -> score
  calculatedCaScore?: number;
  calculatedWeScore?: number;
  calculatedTotalScore?: number;
  calculatedLetter?: string;
}

export interface CsvMarksImportRow {
  rowNumber: number;
  studentNumber: string;
  studentName?: string;
  score: number;
  remarks?: string;
  isValid: boolean;
  errorReason?: string;
}

export interface CsvParseResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  parsedRows: CsvMarksImportRow[];
}

export type SessionType = 'LECTURE' | 'LAB' | 'TUTORIAL' | 'WORKSHOP';

export interface StudentAttendanceRecordItem {
  recordId?: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  email: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceSessionDetail {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  lecturerId: string;
  lecturerName: string;
  sessionDate: string;
  sessionType: SessionType;
  topic: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  records: StudentAttendanceRecordItem[];
}

export interface AttentionQueueItem {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  email: string;
  moduleCode: string;
  moduleTitle: string;
  issueType: 'LOW_ATTENDANCE' | 'LOW_GRADE' | 'MISSING_SUBMISSION' | 'ACADEMIC_RISK';
  severity: RiskLevel;
  metricValue: string;
  recommendedAction: string;
  lastContactDate?: string;
}

export interface TopicDiagnosticItem {
  topicId: string;
  topicName: string;
  assessmentCount: number;
  averageScorePercentage: number;
  difficultyRating: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'CRITICAL_GAP';
  studentPassPercentage: number;
}
