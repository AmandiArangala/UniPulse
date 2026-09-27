export type TimelineCategory = 'ALL' | 'INTERVENTION' | 'ASSESSMENT' | 'ATTENDANCE' | 'LEARNING_EVENT' | 'ENROLLMENT';

export type EventSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface TimelineEventItem {
  eventId: string;
  category: TimelineCategory;
  title: string;
  description: string;
  timestamp: string;
  severity: EventSeverity;
  moduleCode: string;
  initiatorOrSource: string;
  metadata?: Record<string, unknown>;
}

export interface StudentJourneyTimelineData {
  studentId: string;
  studentNumber: string;
  studentName: string;
  programCode: string;
  totalEventsCount: number;
  openInterventionsCount: number;
  timelineEvents: TimelineEventItem[];
}
