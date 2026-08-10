import { PracticeProgressSummary } from '@/types/practice';

export const calculateAccuracy = (correctCount: number, answeredCount: number): number => {
  if (answeredCount <= 0) {
    return 0;
  }

  return correctCount / answeredCount;
};

export const formatAccuracyPercentage = (accuracy: number): string =>
  `${Math.round(Math.min(Math.max(accuracy, 0), 1) * 100)}%`;

export const createEmptyPracticeProgressSummary = (): PracticeProgressSummary => ({
  overallAccuracy: 0,
  practiceSessions: 0,
  examAttempts: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  sectionPerformance: [],
  topicPerformance: [],
  recentSessions: [],
});

export const formatPracticeSessionDate = (
  isoDate: string,
  now: Date = new Date(),
): string => {
  const date = new Date(isoDate);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfNow.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: startOfNow.getFullYear() === startOfDate.getFullYear() ? undefined : 'numeric',
  }).format(date);
};

export const formatPracticeActivityTimestamp = (
  isoDate: string,
  now: Date = new Date(),
): string => {
  const date = new Date(isoDate);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfNow.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return `Today, ${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)}`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: startOfNow.getFullYear() === startOfDate.getFullYear() ? undefined : 'numeric',
  }).format(date);
};
