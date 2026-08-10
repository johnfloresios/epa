import { CertificationSectionCode } from '@/types/content';

export type ReadinessStatus =
  | 'not_enough_data'
  | 'needs_work'
  | 'improving'
  | 'ready';

export interface SectionReadiness {
  sectionId: string;
  sectionCode: CertificationSectionCode;
  sectionName: string;
  answeredCount: number;
  accuracy: number;
  repeatedMissCount: number;
  recentExamAccuracy: number | null;
  status: ReadinessStatus;
}

export interface ReadinessRecommendation {
  type: 'practice_section' | 'practice_topic' | 'review_missed' | 'build_history';
  title: string;
  description: string;
  sectionId: string | null;
  topicId: string | null;
  questionIds: string[];
  focusReason: string;
}

export interface FocusedStudyPlan {
  title: string;
  description: string;
  sectionId: string;
  topicId: string | null;
  questionIds: string[];
  focusReason: string;
}

export interface ReadinessSummary {
  overallStatus: ReadinessStatus;
  overallLabel: string;
  overallDescription: string;
  totalQuestionsAnswered: number;
  sectionReadiness: SectionReadiness[];
  weakestTopics: Array<{
    sectionId: string;
    sectionCode: CertificationSectionCode;
    sectionName: string;
    topicId: string | null;
    topicName: string | null;
    answeredCount: number;
    accuracy: number;
  }>;
  recentExamPerformance: {
    hasExamHistory: boolean;
    message: string;
  };
  recommendation: ReadinessRecommendation;
  focusedStudyPlan: FocusedStudyPlan | null;
}
