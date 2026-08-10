import { ActivitySectionCode } from '@/types/content';

export interface PracticeSessionRecord {
  id: string;
  userId: string;
  sectionId: string;
  topicId: string | null;
  questionCount: number;
  correctCount: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface PracticeAnswerRecord {
  id: string;
  sessionId: string;
  userId: string;
  sectionId: string;
  topicId: string | null;
  questionOrder: number;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicName: string | null;
  questionId: string;
  questionVersion: number;
  questionText: string | null;
  explanation: string | null;
  selectedChoiceId: string;
  selectedChoiceText: string | null;
  correctChoiceId: string | null;
  correctChoiceText: string | null;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ActivityHistoryItem {
  id: string;
  type: 'practice' | 'exam';
  label: string;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicName: string | null;
  correctCount: number;
  questionCount: number;
  answeredCount: number;
  accuracy: number;
  completedAt: string;
}

export interface PracticePerformanceItem {
  id: string;
  label: string;
  accuracy: number;
  correctCount: number;
  answeredCount: number;
}

export interface PracticeProgressSummary {
  overallAccuracy: number;
  practiceSessions: number;
  examAttempts: number;
  questionsAnswered: number;
  correctAnswers: number;
  sectionPerformance: PracticePerformanceItem[];
  topicPerformance: PracticePerformanceItem[];
  recentSessions: ActivityHistoryItem[];
}

export interface CreatePracticeSessionPayload {
  userId: string;
  sectionId: string;
  topicId: string | null;
  questionCount: number;
  startedAt?: string;
}

export interface RecordPracticeAnswerPayload {
  sessionId: string;
  userId: string;
  sectionId: string;
  topicId: string | null;
  questionOrder: number;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicName: string | null;
  questionId: string;
  questionVersion: number;
  questionText: string | null;
  explanation: string | null;
  selectedChoiceId: string;
  selectedChoiceText: string;
  correctChoiceId: string | null;
  correctChoiceText: string | null;
  isCorrect: boolean;
  answeredAt?: string;
}

export interface CompletePracticeSessionPayload {
  sessionId: string;
  userId: string;
  questionCount: number;
  correctCount: number;
  completedAt?: string;
}

export interface RecentActivityItem extends ActivityHistoryItem {}

export interface DashboardActivitySummary {
  overallAccuracy: number;
  questionsAnswered: number;
  practiceSessions: number;
  examAttempts: number;
  recentActivity: RecentActivityItem[];
  passedExamSectionCodes: ActivitySectionCode[];
  sectionReadiness: DashboardSectionReadiness[];
}

export type DashboardNextStep = 'practice_count' | 'practice_accuracy' | 'practice_exam' | 'complete';

export interface DashboardSectionReadiness {
  sectionCode: ActivitySectionCode;
  practiceAnsweredCount: number;
  practiceCorrectCount: number;
  practiceAccuracy: number;
  hasMinimumPracticeQuestions: boolean;
  hasMinimumPracticeAccuracy: boolean;
  hasPassedPracticeExam: boolean;
  isReady: boolean;
  completedStepCount: number;
  nextStep: DashboardNextStep;
}

export interface PracticeSessionHistoryDetail {
  id: string;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  topicName: string | null;
  correctCount: number;
  questionCount: number;
  accuracy: number;
  completedAt: string | null;
  questionHistory: PracticeAnswerRecord[];
}
