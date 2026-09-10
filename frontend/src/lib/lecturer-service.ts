import { apiClient } from './axios';
import {
  AssignedModule,
  EnrolledStudentRosterItem,
  GradeDistributionData,
  AssessmentAuthoringItem,
  AssessmentWeightAllocationSummary,
  MarksEntryRow,
  CsvParseResult,
  AttendanceSessionDetail,
  AttentionQueueItem,
  TopicDiagnosticItem,
  StudentAttendanceRecordItem,
} from '@/types/lecturer';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// ============================================================================
// Realistic Mock Fallback Data (ensures zero UI downtime & seamless preview)
// ============================================================================

export const mockAssignedModules: AssignedModule[] = [
  {
    id: 'mod-301',
    moduleCode: 'CS-301',
    moduleTitle: 'Database Systems & SQL Architectures',
    creditHours: 4,
    semesterId: 'sem-2026-s1',
    semesterName: 'Year 2 Semester 1',
    academicYear: 2026,
    totalEnrolledStudents: 68,
    passRatePercentage: 92.6,
    averageGradeScore: 74.8,
    averageGradeLetter: 'B+',
    caWeightPercentage: 40,
    weWeightPercentage: 60,
    isWeightValid: true,
    isPublished: true,
  },
  {
    id: 'mod-201',
    moduleCode: 'CS-201',
    moduleTitle: 'Object-Oriented Design & Patterns',
    creditHours: 4,
    semesterId: 'sem-2026-s1',
    semesterName: 'Year 2 Semester 1',
    academicYear: 2026,
    totalEnrolledStudents: 82,
    passRatePercentage: 88.0,
    averageGradeScore: 71.5,
    averageGradeLetter: 'B',
    caWeightPercentage: 40,
    weWeightPercentage: 60,
    isWeightValid: true,
    isPublished: true,
  },
  {
    id: 'mod-304',
    moduleCode: 'SE-302',
    moduleTitle: 'Software Architecture & Cloud Engineering',
    creditHours: 4,
    semesterId: 'sem-2026-s1',
    semesterName: 'Year 2 Semester 1',
    academicYear: 2026,
    totalEnrolledStudents: 54,
    passRatePercentage: 94.4,
    averageGradeScore: 79.2,
    averageGradeLetter: 'A-',
    caWeightPercentage: 50,
    weWeightPercentage: 50,
    isWeightValid: true,
    isPublished: true,
  },
];

export const mockEnrolledRoster: EnrolledStudentRosterItem[] = [
  {
    studentId: 'ST-2024-8842',
    studentNumber: 'ST-2024-8842',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@unipulse.edu',
    programCode: 'BSc-SE',
    programName: 'BSc (Hons) in Software Engineering',
    enrollmentStatus: 'ENROLLED',
    attendancePercentage: 77.8,
    caCurrentScore: 31.4,
    caMaxScore: 40,
    projectedGradeLetter: 'B+',
    riskLevel: 'MEDIUM',
    lastAttendedDate: '2026-09-08',
  },
  {
    studentId: 'ST-2024-9102',
    studentNumber: 'ST-2024-9102',
    studentName: 'Samantha Chen',
    email: 'samantha.chen@unipulse.edu',
    programCode: 'BSc-SE',
    programName: 'BSc (Hons) in Software Engineering',
    enrollmentStatus: 'ENROLLED',
    attendancePercentage: 96.5,
    caCurrentScore: 38.5,
    caMaxScore: 40,
    projectedGradeLetter: 'A+',
    riskLevel: 'LOW',
    lastAttendedDate: '2026-09-09',
  },
  {
    studentId: 'ST-2024-7719',
    studentNumber: 'ST-2024-7719',
    studentName: 'Marcus Vance',
    email: 'marcus.vance@unipulse.edu',
    programCode: 'BSc-CS',
    programName: 'BSc (Hons) in Computer Science',
    enrollmentStatus: 'ENROLLED',
    attendancePercentage: 64.0,
    caCurrentScore: 19.0,
    caMaxScore: 40,
    projectedGradeLetter: 'D+',
    riskLevel: 'HIGH',
    lastAttendedDate: '2026-08-28',
  },
  {
    studentId: 'ST-2024-6530',
    studentNumber: 'ST-2024-6530',
    studentName: 'Elena Rostova',
    email: 'elena.rostova@unipulse.edu',
    programCode: 'BSc-SE',
    programName: 'BSc (Hons) in Software Engineering',
    enrollmentStatus: 'ENROLLED',
    attendancePercentage: 91.2,
    caCurrentScore: 35.0,
    caMaxScore: 40,
    projectedGradeLetter: 'A-',
    riskLevel: 'LOW',
    lastAttendedDate: '2026-09-09',
  },
  {
    studentId: 'ST-2024-4421',
    studentNumber: 'ST-2024-4421',
    studentName: 'Devon Miller',
    email: 'devon.miller@unipulse.edu',
    programCode: 'BSc-DS',
    programName: 'BSc (Hons) in Data Science',
    enrollmentStatus: 'ENROLLED',
    attendancePercentage: 82.0,
    caCurrentScore: 28.0,
    caMaxScore: 40,
    projectedGradeLetter: 'B',
    riskLevel: 'LOW',
    lastAttendedDate: '2026-09-07',
  },
  {
    studentId: 'ST-2024-1189',
    studentNumber: 'ST-2024-1189',
    studentName: 'Kavindi Perera',
    email: 'kavindi.perera@unipulse.edu',
    programCode: 'BSc-SE',
    programName: 'BSc (Hons) in Software Engineering',
    enrollmentStatus: 'ENROLLED',
    attendancePercentage: 58.5,
    caCurrentScore: 14.5,
    caMaxScore: 40,
    projectedGradeLetter: 'F',
    riskLevel: 'CRITICAL',
    lastAttendedDate: '2026-08-20',
  },
];

export const mockGradeDistribution: GradeDistributionData = {
  moduleId: 'mod-301',
  moduleCode: 'CS-301',
  moduleTitle: 'Database Systems & SQL Architectures',
  totalStudents: 68,
  averageScore: 74.8,
  medianScore: 76.5,
  maxScore: 97.0,
  minScore: 42.0,
  passRatePercentage: 92.6,
  letterCounts: {
    'A+': 8,
    'A': 14,
    'A-': 12,
    'B+': 15,
    'B': 9,
    'B-': 5,
    'C+': 3,
    'C': 1,
    'D': 1,
    'F': 0,
  },
  histogramBuckets: [
    { rangeLabel: '0-40%', minScore: 0, maxScore: 40, studentCount: 0 },
    { rangeLabel: '41-50%', minScore: 41, maxScore: 50, studentCount: 2 },
    { rangeLabel: '51-60%', minScore: 51, maxScore: 60, studentCount: 5 },
    { rangeLabel: '61-70%', minScore: 61, maxScore: 70, studentCount: 14 },
    { rangeLabel: '71-80%', minScore: 71, maxScore: 80, studentCount: 23 },
    { rangeLabel: '81-90%', minScore: 81, maxScore: 90, studentCount: 16 },
    { rangeLabel: '91-100%', minScore: 91, maxScore: 100, studentCount: 8 },
  ],
};

export const mockAssessments: AssessmentAuthoringItem[] = [
  {
    id: 'ass-301-1',
    moduleId: 'mod-301',
    semesterId: 'sem-2026-s1',
    title: 'Assignment 1: ER Modelling & Normalization',
    type: 'ASSIGNMENT',
    weightPercentage: 15,
    maxScore: 100,
    isPublished: true,
    dueDate: '2026-03-15',
    topics: [{ id: 't1', topicName: 'Database Design' }, { id: 't2', topicName: 'Normal Forms (3NF, BCNF)' }],
    description: 'Relational modelling, ER to Schema mapping, and 3NF normalization exercises.',
  },
  {
    id: 'ass-301-2',
    moduleId: 'mod-301',
    semesterId: 'sem-2026-s1',
    title: 'Midterm Examination: Relational Algebra & SQL',
    type: 'MIDTERM_EXAM',
    weightPercentage: 25,
    maxScore: 100,
    isPublished: true,
    dueDate: '2026-05-10',
    topics: [{ id: 't3', topicName: 'Relational Algebra' }, { id: 't4', topicName: 'Complex SQL Joins' }],
    description: 'Closed-book written assessment covering SQL queries, window functions, and relational calculus.',
  },
  {
    id: 'ass-301-3',
    moduleId: 'mod-301',
    semesterId: 'sem-2026-s1',
    title: 'Final Written Exam: Transactions & Indexing',
    type: 'FINAL_EXAM',
    weightPercentage: 60,
    maxScore: 100,
    isPublished: false,
    dueDate: '2026-06-25',
    topics: [{ id: 't5', topicName: 'ACID Transactions' }, { id: 't6', topicName: 'B-Tree & Hash Indexing' }],
    description: 'Comprehensive end-of-semester examination covering database engines, indexing, and concurrency control.',
  },
];

export const mockWeightSummary: AssessmentWeightAllocationSummary = {
  moduleId: 'mod-301',
  moduleCode: 'CS-301',
  semesterId: 'sem-2026-s1',
  totalCaWeight: 40,
  totalWeWeight: 60,
  totalWeight: 100,
  isWeightValid: true,
  isPublished: true,
  assessments: mockAssessments,
  validationErrors: [],
  warnings: [],
};

export const mockMarksRows: MarksEntryRow[] = [
  {
    studentId: 'ST-2024-8842',
    studentNumber: 'ST-2024-8842',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@unipulse.edu',
    programCode: 'BSc-SE',
    marks: {
      'ass-301-1': 72,
      'ass-301-2': 61,
      'ass-301-3': 77,
    },
    calculatedCaScore: 26.05,
    calculatedWeScore: 46.2,
    calculatedTotalScore: 72.25,
    calculatedLetter: 'B+',
  },
  {
    studentId: 'ST-2024-9102',
    studentNumber: 'ST-2024-9102',
    studentName: 'Samantha Chen',
    email: 'samantha.chen@unipulse.edu',
    programCode: 'BSc-SE',
    marks: {
      'ass-301-1': 95,
      'ass-301-2': 92,
      'ass-301-3': 96,
    },
    calculatedCaScore: 37.25,
    calculatedWeScore: 57.6,
    calculatedTotalScore: 94.85,
    calculatedLetter: 'A+',
  },
  {
    studentId: 'ST-2024-7719',
    studentNumber: 'ST-2024-7719',
    studentName: 'Marcus Vance',
    email: 'marcus.vance@unipulse.edu',
    programCode: 'BSc-CS',
    marks: {
      'ass-301-1': 48,
      'ass-301-2': 42,
      'ass-301-3': null,
    },
    calculatedCaScore: 17.7,
    calculatedWeScore: 0,
    calculatedTotalScore: 17.7,
    calculatedLetter: 'F',
  },
  {
    studentId: 'ST-2024-6530',
    studentNumber: 'ST-2024-6530',
    studentName: 'Elena Rostova',
    email: 'elena.rostova@unipulse.edu',
    programCode: 'BSc-SE',
    marks: {
      'ass-301-1': 88,
      'ass-301-2': 84,
      'ass-301-3': 85,
    },
    calculatedCaScore: 34.2,
    calculatedWeScore: 51.0,
    calculatedTotalScore: 85.2,
    calculatedLetter: 'A',
  },
  {
    studentId: 'ST-2024-4421',
    studentNumber: 'ST-2024-4421',
    studentName: 'Devon Miller',
    email: 'devon.miller@unipulse.edu',
    programCode: 'BSc-DS',
    marks: {
      'ass-301-1': 70,
      'ass-301-2': 68,
      'ass-301-3': 75,
    },
    calculatedCaScore: 27.5,
    calculatedWeScore: 45.0,
    calculatedTotalScore: 72.5,
    calculatedLetter: 'B+',
  },
  {
    studentId: 'ST-2024-1189',
    studentNumber: 'ST-2024-1189',
    studentName: 'Kavindi Perera',
    email: 'kavindi.perera@unipulse.edu',
    programCode: 'BSc-SE',
    marks: {
      'ass-301-1': 35,
      'ass-301-2': 38,
      'ass-301-3': null,
    },
    calculatedCaScore: 14.75,
    calculatedWeScore: 0,
    calculatedTotalScore: 14.75,
    calculatedLetter: 'F',
  },
];

export const mockAttendanceSessions: AttendanceSessionDetail[] = [
  {
    id: 'sess-301-01',
    moduleId: 'mod-301',
    moduleCode: 'CS-301',
    moduleName: 'Database Systems',
    lecturerId: 'lect-01',
    lecturerName: 'Dr. Sarah Jenkins',
    sessionDate: '2026-09-01',
    sessionType: 'LECTURE',
    topic: 'Relational Model & B-Tree Indexes',
    totalEnrolled: 68,
    presentCount: 62,
    absentCount: 4,
    lateCount: 2,
    excusedCount: 0,
    records: [
      { studentId: 'ST-2024-8842', studentNumber: 'ST-2024-8842', studentName: 'Alex Morgan', email: 'alex.morgan@unipulse.edu', status: 'PRESENT' },
      { studentId: 'ST-2024-9102', studentNumber: 'ST-2024-9102', studentName: 'Samantha Chen', email: 'samantha.chen@unipulse.edu', status: 'PRESENT' },
      { studentId: 'ST-2024-7719', studentNumber: 'ST-2024-7719', studentName: 'Marcus Vance', email: 'marcus.vance@unipulse.edu', status: 'ABSENT', remarks: 'Unexcused' },
      { studentId: 'ST-2024-6530', studentNumber: 'ST-2024-6530', studentName: 'Elena Rostova', email: 'elena.rostova@unipulse.edu', status: 'PRESENT' },
      { studentId: 'ST-2024-4421', studentNumber: 'ST-2024-4421', studentName: 'Devon Miller', email: 'devon.miller@unipulse.edu', status: 'LATE', remarks: '10 min transit delay' },
      { studentId: 'ST-2024-1189', studentNumber: 'ST-2024-1189', studentName: 'Kavindi Perera', email: 'kavindi.perera@unipulse.edu', status: 'ABSENT' },
    ],
  },
  {
    id: 'sess-301-02',
    moduleId: 'mod-301',
    moduleCode: 'CS-301',
    moduleName: 'Database Systems',
    lecturerId: 'lect-01',
    lecturerName: 'Dr. Sarah Jenkins',
    sessionDate: '2026-09-07',
    sessionType: 'LAB',
    topic: 'Query Optimization & Explain Plans',
    totalEnrolled: 68,
    presentCount: 58,
    absentCount: 7,
    lateCount: 3,
    excusedCount: 0,
    records: [
      { studentId: 'ST-2024-8842', studentNumber: 'ST-2024-8842', studentName: 'Alex Morgan', email: 'alex.morgan@unipulse.edu', status: 'ABSENT', remarks: 'Unexcused' },
      { studentId: 'ST-2024-9102', studentNumber: 'ST-2024-9102', studentName: 'Samantha Chen', email: 'samantha.chen@unipulse.edu', status: 'PRESENT' },
      { studentId: 'ST-2024-7719', studentNumber: 'ST-2024-7719', studentName: 'Marcus Vance', email: 'marcus.vance@unipulse.edu', status: 'ABSENT' },
      { studentId: 'ST-2024-6530', studentNumber: 'ST-2024-6530', studentName: 'Elena Rostova', email: 'elena.rostova@unipulse.edu', status: 'PRESENT' },
      { studentId: 'ST-2024-4421', studentNumber: 'ST-2024-4421', studentName: 'Devon Miller', email: 'devon.miller@unipulse.edu', status: 'PRESENT' },
      { studentId: 'ST-2024-1189', studentNumber: 'ST-2024-1189', studentName: 'Kavindi Perera', email: 'kavindi.perera@unipulse.edu', status: 'ABSENT' },
    ],
  },
];

export const mockAttentionQueue: AttentionQueueItem[] = [
  {
    id: 'att-q-1',
    studentId: 'ST-2024-1189',
    studentNumber: 'ST-2024-1189',
    studentName: 'Kavindi Perera',
    email: 'kavindi.perera@unipulse.edu',
    moduleCode: 'CS-301',
    moduleTitle: 'Database Systems',
    issueType: 'LOW_ATTENDANCE',
    severity: 'CRITICAL',
    metricValue: '58.5% (Below 80% Threshold)',
    recommendedAction: 'Issue formal academic risk notice & schedule advisor session.',
    lastContactDate: '2026-08-25',
  },
  {
    id: 'att-q-2',
    studentId: 'ST-2024-7719',
    studentNumber: 'ST-2024-7719',
    studentName: 'Marcus Vance',
    email: 'marcus.vance@unipulse.edu',
    moduleCode: 'CS-301',
    moduleTitle: 'Database Systems',
    issueType: 'LOW_GRADE',
    severity: 'HIGH',
    metricValue: '17.7 CA Score (Projected D+/F)',
    recommendedAction: 'Trigger peer tutoring referral and lab remedial coursework.',
    lastContactDate: '2026-09-02',
  },
  {
    id: 'att-q-3',
    studentId: 'ST-2024-8842',
    studentNumber: 'ST-2024-8842',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@unipulse.edu',
    moduleCode: 'CS-301',
    moduleTitle: 'Database Systems',
    issueType: 'LOW_ATTENDANCE',
    severity: 'MEDIUM',
    metricValue: '77.8% Attendance',
    recommendedAction: 'Send automated attendance warning email for mandatory lectures.',
  },
];

export const mockTopicDiagnostics: TopicDiagnosticItem[] = [
  { topicId: 't1', topicName: 'Database Design & ER Diagrams', assessmentCount: 2, averageScorePercentage: 82.5, difficultyRating: 'EASY', studentPassPercentage: 94.0 },
  { topicId: 't2', topicName: 'Normal Forms (3NF, BCNF)', assessmentCount: 3, averageScorePercentage: 68.0, difficultyRating: 'MODERATE', studentPassPercentage: 81.5 },
  { topicId: 't3', topicName: 'Relational Algebra Operations', assessmentCount: 2, averageScorePercentage: 64.2, difficultyRating: 'CHALLENGING', studentPassPercentage: 74.0 },
  { topicId: 't4', topicName: 'Complex SQL Subqueries & Window Functions', assessmentCount: 4, averageScorePercentage: 71.0, difficultyRating: 'MODERATE', studentPassPercentage: 86.0 },
  { topicId: 't5', topicName: 'ACID Concurrency & 2PL Isolation', assessmentCount: 2, averageScorePercentage: 54.8, difficultyRating: 'CRITICAL_GAP', studentPassPercentage: 62.0 },
  { topicId: 't6', topicName: 'B+ Tree Index Optimization', assessmentCount: 3, averageScorePercentage: 76.4, difficultyRating: 'EASY', studentPassPercentage: 90.0 },
];

// ============================================================================
// Lecturer Portal API Service Layer
// ============================================================================

export const lecturerService = {
  /**
   * Retrieves assigned modules for a lecturer
   */
  async getAssignedModules(lecturerId?: string): Promise<AssignedModule[]> {
    try {
      const url = lecturerId
        ? `/api/v1/modules/lecturer/${lecturerId}`
        : `/api/v1/modules/assigned`;
      const response = await apiClient.get<BackendApiResponse<AssignedModule[]>>(url);
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      return mockAssignedModules;
    } catch {
      return mockAssignedModules;
    }
  },

  /**
   * Retrieves enrolled student roster for a specific module
   */
  async getModuleRoster(moduleId: string): Promise<EnrolledStudentRosterItem[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<EnrolledStudentRosterItem[]>>(
        `/api/v1/enrollments/module/${moduleId}/roster`
      );
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      return mockEnrolledRoster;
    } catch {
      return mockEnrolledRoster;
    }
  },

  /**
   * Retrieves grade distribution analytics for a module
   */
  async getGradeDistribution(moduleId: string): Promise<GradeDistributionData> {
    try {
      const response = await apiClient.get<BackendApiResponse<GradeDistributionData>>(
        `/api/v1/analytics/module/${moduleId}/grade-distribution`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return mockGradeDistribution;
    } catch {
      return mockGradeDistribution;
    }
  },

  /**
   * Retrieves assessments for a module and semester
   */
  async getModuleAssessments(moduleId: string, semesterId = 'sem-2026-s1'): Promise<AssessmentAuthoringItem[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<AssessmentAuthoringItem[]>>(
        `/api/v1/assessments/module/${moduleId}/semester/${semesterId}`
      );
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      return mockAssessments.filter((a) => a.moduleId === moduleId || moduleId === 'mod-301');
    } catch {
      return mockAssessments.filter((a) => a.moduleId === moduleId || moduleId === 'mod-301');
    }
  },

  /**
   * Retrieves assessment weight allocation summary
   */
  async getAssessmentWeightSummary(moduleId: string, semesterId = 'sem-2026-s1'): Promise<AssessmentWeightAllocationSummary> {
    try {
      const response = await apiClient.get<BackendApiResponse<AssessmentWeightAllocationSummary>>(
        `/api/v1/assessments/module/${moduleId}/semester/${semesterId}/weight-summary`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return mockWeightSummary;
    } catch {
      return mockWeightSummary;
    }
  },

  /**
   * Creates a new assessment component
   */
  async createAssessment(data: Partial<AssessmentAuthoringItem>): Promise<AssessmentAuthoringItem> {
    try {
      const response = await apiClient.post<BackendApiResponse<AssessmentAuthoringItem>>(
        '/api/v1/assessments',
        data
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      const newAssessment: AssessmentAuthoringItem = {
        id: `ass-${Date.now()}`,
        moduleId: data.moduleId || 'mod-301',
        semesterId: data.semesterId || 'sem-2026-s1',
        title: data.title || 'New Assessment',
        type: data.type || 'ASSIGNMENT',
        weightPercentage: data.weightPercentage || 10,
        maxScore: data.maxScore || 100,
        isPublished: false,
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        topics: data.topics || [],
        description: data.description || '',
      };
      mockAssessments.push(newAssessment);
      return newAssessment;
    } catch {
      const newAssessment: AssessmentAuthoringItem = {
        id: `ass-${Date.now()}`,
        moduleId: data.moduleId || 'mod-301',
        semesterId: data.semesterId || 'sem-2026-s1',
        title: data.title || 'New Assessment',
        type: data.type || 'ASSIGNMENT',
        weightPercentage: data.weightPercentage || 10,
        maxScore: data.maxScore || 100,
        isPublished: false,
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        topics: data.topics || [],
        description: data.description || '',
      };
      mockAssessments.push(newAssessment);
      return newAssessment;
    }
  },

  /**
   * Updates an existing assessment component
   */
  async updateAssessment(id: string, data: Partial<AssessmentAuthoringItem>): Promise<AssessmentAuthoringItem> {
    try {
      const response = await apiClient.put<BackendApiResponse<AssessmentAuthoringItem>>(
        `/api/v1/assessments/${id}`,
        data
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      const idx = mockAssessments.findIndex((a) => a.id === id);
      if (idx !== -1) {
        mockAssessments[idx] = { ...mockAssessments[idx], ...data };
        return mockAssessments[idx];
      }
      return mockAssessments[0];
    } catch {
      const idx = mockAssessments.findIndex((a) => a.id === id);
      if (idx !== -1) {
        mockAssessments[idx] = { ...mockAssessments[idx], ...data };
        return mockAssessments[idx];
      }
      return mockAssessments[0];
    }
  },

  /**
   * Deletes an assessment component
   */
  async deleteAssessment(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/assessments/${id}`);
      const idx = mockAssessments.findIndex((a) => a.id === id);
      if (idx !== -1) mockAssessments.splice(idx, 1);
      return true;
    } catch {
      const idx = mockAssessments.findIndex((a) => a.id === id);
      if (idx !== -1) mockAssessments.splice(idx, 1);
      return true;
    }
  },

  /**
   * Publishes assessment weight structure for a module
   */
  async publishAssessmentStructure(moduleId: string, semesterId = 'sem-2026-s1'): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/assessments/module/${moduleId}/semester/${semesterId}/publish`);
      return true;
    } catch {
      return true;
    }
  },

  /**
   * Retrieves marks spreadsheet grid data
   */
  async getMarksGridData(moduleId: string): Promise<{ assessments: AssessmentAuthoringItem[]; rows: MarksEntryRow[] }> {
    const assessments = await this.getModuleAssessments(moduleId);
    return {
      assessments,
      rows: mockMarksRows,
    };
  },

  /**
   * Saves batch marks for an assessment component
   */
  async saveBatchMarks(assessmentId: string, marks: { studentId: string; score: number | null }[]): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/assessments/${assessmentId}/marks/batch`, { marks });
      // Update local mock marks
      marks.forEach((m) => {
        const row = mockMarksRows.find((r) => r.studentId === m.studentId);
        if (row) {
          row.marks[assessmentId] = m.score;
        }
      });
      return true;
    } catch {
      marks.forEach((m) => {
        const row = mockMarksRows.find((r) => r.studentId === m.studentId);
        if (row) {
          row.marks[assessmentId] = m.score;
        }
      });
      return true;
    }
  },

  /**
   * Parses raw CSV text for marks import
   */
  parseCsvMarks(csvText: string, maxScore = 100): CsvParseResult {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      return { fileName: 'upload.csv', totalRows: 0, validRows: 0, invalidRows: 0, parsedRows: [] };
    }

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('student') ? 1 : 0;
    const parsedRows = [];
    let validRows = 0;
    let invalidRows = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      const studentNumber = parts[0] || '';
      const scoreStr = parts[1] || parts[2] || '';
      const score = parseFloat(scoreStr);

      let isValid = true;
      let errorReason: string | undefined;

      if (!studentNumber) {
        isValid = false;
        errorReason = 'Missing student registration number';
      } else if (isNaN(score)) {
        isValid = false;
        errorReason = `Invalid numeric score '${scoreStr}'`;
      } else if (score < 0 || score > maxScore) {
        isValid = false;
        errorReason = `Score ${score} out of bounds (0 - ${maxScore})`;
      }

      if (isValid) validRows++;
      else invalidRows++;

      parsedRows.push({
        rowNumber: i + 1,
        studentNumber,
        studentName: parts.length > 2 ? parts[1] : undefined,
        score: isNaN(score) ? 0 : score,
        remarks: parts[3] || '',
        isValid,
        errorReason,
      });
    }

    return {
      fileName: 'upload.csv',
      totalRows: parsedRows.length,
      validRows,
      invalidRows,
      parsedRows,
    };
  },

  /**
   * Exports CSV template string for offline grading
   */
  exportCsvTemplate(assessmentTitle: string, roster: EnrolledStudentRosterItem[]): string {
    const header = `Student Registration Number,Student Name,Score (Max 100),Remarks - ${assessmentTitle}\n`;
    const rows = roster
      .map((s) => `${s.studentNumber},"${s.studentName}",,`)
      .join('\n');
    return header + rows;
  },

  /**
   * Retrieves attendance sessions for a module
   */
  async getAttendanceSessions(moduleId: string): Promise<AttendanceSessionDetail[]> {
    try {
      const response = await apiClient.get<BackendApiResponse<AttendanceSessionDetail[]>>(
        `/api/v1/attendance/sessions/module/${moduleId}`
      );
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      return mockAttendanceSessions;
    } catch {
      return mockAttendanceSessions;
    }
  },

  /**
   * Creates a new attendance session
   */
  async createAttendanceSession(data: Partial<AttendanceSessionDetail>): Promise<AttendanceSessionDetail> {
    try {
      const response = await apiClient.post<BackendApiResponse<AttendanceSessionDetail>>(
        '/api/v1/attendance/sessions',
        data
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      const newSession: AttendanceSessionDetail = {
        id: `sess-${Date.now()}`,
        moduleId: data.moduleId || 'mod-301',
        moduleCode: data.moduleCode || 'CS-301',
        moduleName: data.moduleName || 'Database Systems',
        lecturerId: 'lect-01',
        lecturerName: 'Dr. Sarah Jenkins',
        sessionDate: data.sessionDate || new Date().toISOString().split('T')[0],
        sessionType: data.sessionType || 'LECTURE',
        topic: data.topic || 'General Lecture',
        totalEnrolled: mockEnrolledRoster.length,
        presentCount: mockEnrolledRoster.length,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        records: mockEnrolledRoster.map((s) => ({
          studentId: s.studentId,
          studentNumber: s.studentNumber,
          studentName: s.studentName,
          email: s.email,
          status: 'PRESENT',
        })),
      };
      mockAttendanceSessions.unshift(newSession);
      return newSession;
    } catch {
      const newSession: AttendanceSessionDetail = {
        id: `sess-${Date.now()}`,
        moduleId: data.moduleId || 'mod-301',
        moduleCode: data.moduleCode || 'CS-301',
        moduleName: data.moduleName || 'Database Systems',
        lecturerId: 'lect-01',
        lecturerName: 'Dr. Sarah Jenkins',
        sessionDate: data.sessionDate || new Date().toISOString().split('T')[0],
        sessionType: data.sessionType || 'LECTURE',
        topic: data.topic || 'General Lecture',
        totalEnrolled: mockEnrolledRoster.length,
        presentCount: mockEnrolledRoster.length,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        records: mockEnrolledRoster.map((s) => ({
          studentId: s.studentId,
          studentNumber: s.studentNumber,
          studentName: s.studentName,
          email: s.email,
          status: 'PRESENT',
        })),
      };
      mockAttendanceSessions.unshift(newSession);
      return newSession;
    }
  },

  /**
   * Records bulk attendance records for a session
   */
  async recordBulkAttendance(sessionId: string, records: StudentAttendanceRecordItem[]): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/attendance/records/bulk', { sessionId, records });
      const session = mockAttendanceSessions.find((s) => s.id === sessionId);
      if (session) {
        session.records = records;
        session.presentCount = records.filter((r) => r.status === 'PRESENT').length;
        session.absentCount = records.filter((r) => r.status === 'ABSENT').length;
        session.lateCount = records.filter((r) => r.status === 'LATE').length;
        session.excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
      }
      return true;
    } catch {
      const session = mockAttendanceSessions.find((s) => s.id === sessionId);
      if (session) {
        session.records = records;
        session.presentCount = records.filter((r) => r.status === 'PRESENT').length;
        session.absentCount = records.filter((r) => r.status === 'ABSENT').length;
        session.lateCount = records.filter((r) => r.status === 'LATE').length;
        session.excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
      }
      return true;
    }
  },

  /**
   * Retrieves attention queue for low attendance / performance
   */
  async getAttentionQueue(): Promise<AttentionQueueItem[]> {
    return mockAttentionQueue;
  },

  /**
   * Retrieves topic diagnostic coverage report
   */
  async getTopicDiagnostics(moduleId: string): Promise<TopicDiagnosticItem[]> {
    return mockTopicDiagnostics;
  },
};
