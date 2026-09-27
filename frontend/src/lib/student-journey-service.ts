import { apiClient } from './axios';
import { StudentJourneyTimelineData } from '@/types/timeline';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const mockStudentJourneyTimeline: StudentJourneyTimelineData = {
  studentId: 'STU-2026-8941',
  studentNumber: 'STU-2026-8941',
  studentName: 'Alex Mercer',
  programCode: 'BSc-SE',
  totalEventsCount: 6,
  openInterventionsCount: 1,
  timelineEvents: [
    {
      eventId: 'ev-1',
      category: 'INTERVENTION',
      title: 'Academic Support: ADVISOR CONSULTATION',
      description: 'Reason: Midterm examination score dropped below 50%. Discussed study plan and peer tutoring.',
      timestamp: '2026-09-20T14:30:00Z',
      severity: 'WARNING',
      moduleCode: 'CS-301',
      initiatorOrSource: 'Dr. Sarah Jenkins (Advisor)',
      metadata: { status: 'IN_PROGRESS', notes: 'Student agreed to attend weekly remedial lab hours.' },
    },
    {
      eventId: 'ev-2',
      category: 'ASSESSMENT',
      title: 'Assessment Graded: Midterm Exam - SQL & Relational Algebra',
      description: 'Score: 48.0 / 100.0 (48.0%)',
      timestamp: '2026-09-15T11:00:00Z',
      severity: 'CRITICAL',
      moduleCode: 'CS-301',
      initiatorOrSource: 'Examiner / Lecturer',
      metadata: { scoreObtained: 48, maxMarks: 100, percentage: 48 },
    },
    {
      eventId: 'ev-3',
      category: 'ATTENDANCE',
      title: 'Attendance Marked: ABSENT',
      description: 'Class session recorded as absent.',
      timestamp: '2026-09-12T09:00:00Z',
      severity: 'CRITICAL',
      moduleCode: 'CS-301',
      initiatorOrSource: 'Attendance Scanner',
      metadata: { status: 'ABSENT', remarks: 'Unexcused absence' },
    },
    {
      eventId: 'ev-4',
      category: 'LEARNING_EVENT',
      title: 'Portal Activity: QUIZ_ATTEMPTED',
      description: 'Activity registered via Canvas LMS Portal',
      timestamp: '2026-09-08T18:45:00Z',
      severity: 'INFO',
      moduleCode: 'CS-301',
      initiatorOrSource: 'LMS Portal',
    },
    {
      eventId: 'ev-5',
      category: 'ASSESSMENT',
      title: 'Assessment Graded: Assignment 1 - ER Modelling',
      description: 'Score: 82.0 / 100.0 (82.0%)',
      timestamp: '2026-09-01T10:00:00Z',
      severity: 'SUCCESS',
      moduleCode: 'CS-301',
      initiatorOrSource: 'Examiner / Lecturer',
      metadata: { scoreObtained: 82, maxMarks: 100, percentage: 82 },
    },
    {
      eventId: 'ev-6',
      category: 'ENROLLMENT',
      title: 'Module Registration: CS-301',
      description: 'Enrollment status set to ENROLLED',
      timestamp: '2026-08-25T08:00:00Z',
      severity: 'INFO',
      moduleCode: 'CS-301',
      initiatorOrSource: 'Academic Registry',
    },
  ],
};

export const studentJourneyService = {
  async getStudentJourneyTimeline(studentId: string): Promise<StudentJourneyTimelineData> {
    try {
      const res = await apiClient.get<ApiResponse<StudentJourneyTimelineData>>(`/api/v1/student-journey/${studentId}`);
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return mockStudentJourneyTimeline;
    } catch {
      return mockStudentJourneyTimeline;
    }
  },
};
