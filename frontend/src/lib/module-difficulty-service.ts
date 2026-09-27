import { apiClient } from './axios';
import { ModuleDifficultyIndexItem, TopicMasteryGapItem, AssessmentDifficultyItem } from '@/types/difficulty';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const mockModuleDifficultyIndex: ModuleDifficultyIndexItem = {
  moduleId: 'mod-301',
  moduleCode: 'CS-301',
  moduleTitle: 'Database Systems & SQL Architectures',
  totalEnrolled: 68,
  failureRate: 14.7,
  meanFinalMark: 68.4,
  repeatRate: 8.8,
  withdrawalRate: 5.8,
  difficultyIndexScore: 58.2,
  difficultyBand: 'HIGH',
  summaryInsight: 'Module difficulty categorized as HIGH. Noticeable failure rate in Midterm exam and topic gaps in ACID transactions.',
  assessments: [
    {
      assessmentId: 'ass-301-1',
      assessmentName: 'Assignment 1: ER Modelling',
      moduleCode: 'CS-301',
      moduleTitle: 'Database Systems',
      weightage: 15,
      totalStudentsEvaluated: 68,
      averageScore: 82.5,
      medianScore: 84.0,
      standardDeviation: 9.4,
      failureRate: 2.9,
      passRate: 97.1,
      difficultyBand: 'EASY',
      topicMasteryGaps: [
        {
          topicId: 't1',
          topicName: 'Database Design & ER Diagrams',
          assessmentCount: 1,
          averageScorePercentage: 82.5,
          studentPassPercentage: 97.1,
          masteryGapPercentage: 17.5,
          difficultyRating: 'WELL_MASTERED',
          recommendation: 'Students demonstrate strong understanding of ER conceptual modelling.',
        },
      ],
    },
    {
      assessmentId: 'ass-301-2',
      assessmentName: 'Midterm Exam: Relational Algebra & SQL',
      moduleCode: 'CS-301',
      moduleTitle: 'Database Systems',
      weightage: 25,
      totalStudentsEvaluated: 68,
      averageScore: 58.4,
      medianScore: 61.0,
      standardDeviation: 18.2,
      failureRate: 26.5,
      passRate: 73.5,
      difficultyBand: 'HARD',
      topicMasteryGaps: [
        {
          topicId: 't3',
          topicName: 'Relational Algebra Operations',
          assessmentCount: 1,
          averageScorePercentage: 54.8,
          studentPassPercentage: 64.0,
          masteryGapPercentage: 45.2,
          difficultyRating: 'CRITICAL_GAP',
          recommendation: 'Schedule targeted tutorial session on set operators and relational join expressions.',
        },
        {
          topicId: 't4',
          topicName: 'Complex SQL Subqueries & Window Functions',
          assessmentCount: 1,
          averageScorePercentage: 62.0,
          studentPassPercentage: 75.0,
          masteryGapPercentage: 38.0,
          difficultyRating: 'CHALLENGING',
          recommendation: 'Provide extra practice problems on subqueries and window functions.',
        },
      ],
    },
  ],
  topicDiagnostics: [
    {
      topicId: 't1',
      topicName: 'Database Design & ER Diagrams',
      assessmentCount: 2,
      averageScorePercentage: 82.5,
      studentPassPercentage: 97.1,
      masteryGapPercentage: 17.5,
      difficultyRating: 'WELL_MASTERED',
      recommendation: 'Students demonstrate strong understanding.',
    },
    {
      topicId: 't2',
      topicName: 'Normal Forms (3NF, BCNF)',
      assessmentCount: 3,
      averageScorePercentage: 68.0,
      studentPassPercentage: 81.5,
      masteryGapPercentage: 32.0,
      difficultyRating: 'MODERATE',
      recommendation: 'Topic understanding is acceptable. Provide optional drill exercises.',
    },
    {
      topicId: 't3',
      topicName: 'Relational Algebra Operations',
      assessmentCount: 2,
      averageScorePercentage: 54.8,
      studentPassPercentage: 64.0,
      masteryGapPercentage: 45.2,
      difficultyRating: 'CRITICAL_GAP',
      recommendation: 'Schedule mandatory review tutorial and provide targeted practice problem sets.',
    },
    {
      topicId: 't5',
      topicName: 'ACID Concurrency & 2PL Isolation',
      assessmentCount: 2,
      averageScorePercentage: 51.2,
      studentPassPercentage: 58.0,
      masteryGapPercentage: 48.8,
      difficultyRating: 'CRITICAL_GAP',
      recommendation: 'Re-explain core concepts in lecture and assign supplementary learning materials.',
    },
  ],
};

export const moduleDifficultyService = {
  async getModuleDifficultyIndex(moduleId: string): Promise<ModuleDifficultyIndexItem> {
    try {
      const res = await apiClient.get<ApiResponse<ModuleDifficultyIndexItem>>(`/api/v1/difficulty/module/${moduleId}`);
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return mockModuleDifficultyIndex;
    } catch {
      return mockModuleDifficultyIndex;
    }
  },

  async getTopicDiagnostics(moduleId: string): Promise<TopicMasteryGapItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<TopicMasteryGapItem[]>>(`/api/v1/difficulty/module/${moduleId}/topics`);
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
      return mockModuleDifficultyIndex.topicDiagnostics;
    } catch {
      return mockModuleDifficultyIndex.topicDiagnostics;
    }
  },

  async getModuleAssessmentsDifficulty(moduleId: string): Promise<AssessmentDifficultyItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<AssessmentDifficultyItem[]>>(`/api/v1/difficulty/module/${moduleId}/assessments`);
      if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return mockModuleDifficultyIndex.assessments;
    } catch {
      return mockModuleDifficultyIndex.assessments;
    }
  },

  async getAllModuleDifficultyIndexes(): Promise<ModuleDifficultyIndexItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<ModuleDifficultyIndexItem[]>>('/api/v1/difficulty/all');
      if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [mockModuleDifficultyIndex];
    } catch {
      return [mockModuleDifficultyIndex];
    }
  },
};
