import { ActivitySectionCode } from '@/types/content';

export type ExamType = ActivitySectionCode;

export interface ExamAttemptRecord {
  id: string;
  userId: string;
  examType: ExamType;
  sectionId: string | null;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface ExamAnswerRecord {
  id: string;
  examAttemptId: string;
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

export interface CreateExamAttemptPayload {
  userId: string;
  examType: ExamType;
  sectionId: string | null;
  questionCount: number;
  startedAt?: string;
}

export interface SaveExamAnswerPayload {
  examAttemptId: string;
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
  answeredAt?: string;
}

export interface CompleteExamAttemptPayload {
  examAttemptId: string;
  userId: string;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  completedAt?: string;
}

export interface ExamAttemptHistoryDetail {
  id: string;
  examType: ExamType;
  sectionCode: ActivitySectionCode;
  sectionName: string;
  correctCount: number;
  answeredCount: number;
  questionCount: number;
  accuracy: number;
  completedAt: string | null;
  questionHistory: ExamAnswerRecord[];
}
