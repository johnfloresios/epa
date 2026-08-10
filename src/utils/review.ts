import { studyConfig } from '@/config/study';
import { PerformanceMetric, WeakAreaItem, WeakAreaStatus } from '@/types/review';

export const getWeakAreaStatus = (accuracy: number, answeredCount: number): WeakAreaStatus => {
  if (answeredCount < studyConfig.minimumAnswersForWeakArea) {
    return 'not_enough_data';
  }

  if (accuracy < studyConfig.masteryThresholds.needsAttention) {
    return 'needs_attention';
  }

  if (accuracy < studyConfig.masteryThresholds.developing) {
    return 'developing';
  }

  return 'strong';
};

export const getWeakAreaStatusLabel = (status: WeakAreaStatus): string => {
  if (status === 'needs_attention') {
    return 'Needs Attention';
  }

  if (status === 'developing') {
    return 'Developing';
  }

  if (status === 'strong') {
    return 'Strong';
  }

  return 'Not enough data yet';
};

export const buildWeakAreas = (
  sectionPerformance: PerformanceMetric[],
  topicPerformance: PerformanceMetric[],
): WeakAreaItem[] => {
  const metrics: WeakAreaItem[] = [
    ...sectionPerformance.map((metric) => ({
      key: `section-${metric.sectionId}`,
      type: 'section' as const,
      sectionId: metric.sectionId,
      sectionCode: metric.sectionCode,
      sectionName: metric.sectionName,
      topicId: null,
      topicName: null,
      answeredCount: metric.answeredCount,
      correctCount: metric.correctCount,
      incorrectCount: metric.incorrectCount,
      accuracy: metric.accuracy,
      status: getWeakAreaStatus(metric.accuracy, metric.answeredCount),
    })),
    ...topicPerformance.map((metric) => ({
      key: `topic-${metric.topicId}`,
      type: 'topic' as const,
      sectionId: metric.sectionId,
      sectionCode: metric.sectionCode,
      sectionName: metric.sectionName,
      topicId: metric.topicId,
      topicName: metric.topicName,
      answeredCount: metric.answeredCount,
      correctCount: metric.correctCount,
      incorrectCount: metric.incorrectCount,
      accuracy: metric.accuracy,
      status: getWeakAreaStatus(metric.accuracy, metric.answeredCount),
    })),
  ];

  return metrics.sort((left, right) => {
    if (left.status === 'not_enough_data' && right.status !== 'not_enough_data') {
      return 1;
    }

    if (right.status === 'not_enough_data' && left.status !== 'not_enough_data') {
      return -1;
    }

    return left.accuracy - right.accuracy || right.answeredCount - left.answeredCount;
  });
};
