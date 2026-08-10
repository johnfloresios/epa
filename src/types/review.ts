import { ActivitySectionCode } from '@/types/content';

export type WeakAreaStatus =
  | 'not_enough_data'
  | 'needs_attention'
  | 'developing'
  | 'strong';

export interface PerformanceMetric {
  sectionId: string;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicId: string | null;
  topicName: string | null;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
}

export interface WeakAreaItem {
  key: string;
  type: 'section' | 'topic';
  sectionId: string;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicId: string | null;
  topicName: string | null;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  status: WeakAreaStatus;
}

export interface MissedQuestionSummary {
  questionId: string;
  sectionId: string;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicId: string | null;
  topicName: string | null;
  questionText: string | null;
  attemptsCount: number;
  incorrectCount: number;
  lastAttempted: string;
  latestAnswerId: string;
  latestQuestionVersion: number;
}

export interface QuestionAttemptHistoryItem {
  answerId: string;
  sessionId: string;
  questionOrder: number;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicName: string | null;
  questionText: string | null;
  selectedChoiceText: string | null;
  correctChoiceText: string | null;
  isCorrect: boolean;
  questionVersion: number;
  explanation: string | null;
  answeredAt: string;
}

export interface MissedQuestionDetail {
  questionId: string;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicName: string | null;
  questionText: string | null;
  mostRecentAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  attemptHistory: QuestionAttemptHistoryItem[];
}

export interface ReviewInsightsSummary {
  sectionPerformance: PerformanceMetric[];
  topicPerformance: PerformanceMetric[];
  weakAreas: WeakAreaItem[];
  missedQuestions: MissedQuestionSummary[];
}
