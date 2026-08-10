import { buildReadinessSummary, getReadinessStatusLabel } from '@/utils/readiness';
import { PerformanceMetric, WeakAreaItem } from '@/types/review';

const makeSectionMetric = (
  sectionId: string,
  sectionCode: 'CORE' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III',
  accuracy: number,
  answeredCount: number,
): PerformanceMetric => ({
  sectionId,
  sectionCode,
  sectionName:
    sectionCode === 'CORE'
      ? 'Core'
      : sectionCode === 'TYPE_I'
        ? 'Type I'
        : sectionCode === 'TYPE_II'
          ? 'Type II'
          : 'Type III',
  topicId: null,
  topicName: null,
  answeredCount,
  correctCount: Math.round(answeredCount * accuracy),
  incorrectCount: answeredCount - Math.round(answeredCount * accuracy),
  accuracy,
});

describe('readiness utilities', () => {
  it('returns not enough data until all four sections have enough answered questions', () => {
    const summary = buildReadinessSummary({
      sectionPerformance: [
        makeSectionMetric('1', 'CORE', 0.9, 25),
        makeSectionMetric('2', 'TYPE_I', 0.88, 21),
      ],
      topicPerformance: [],
      weakAreas: [],
      missedQuestions: [],
      focusedStudyPlan: null,
    });

    expect(summary.overallStatus).toBe('not_enough_data');
    expect(summary.overallLabel).toBe('Not Enough Data');
  });

  it('uses the weakest section as the overall readiness status', () => {
    const sectionPerformance = [
      makeSectionMetric('1', 'CORE', 0.9, 25),
      makeSectionMetric('2', 'TYPE_I', 0.86, 24),
      makeSectionMetric('3', 'TYPE_II', 0.62, 26),
      makeSectionMetric('4', 'TYPE_III', 0.91, 28),
    ];

    const weakAreas: WeakAreaItem[] = [];

    const summary = buildReadinessSummary({
      sectionPerformance,
      topicPerformance: [],
      weakAreas,
      missedQuestions: [],
      focusedStudyPlan: null,
    });

    expect(summary.overallStatus).toBe('needs_work');
    expect(summary.sectionReadiness.find((section) => section.sectionCode === 'TYPE_II')?.status).toBe('needs_work');
  });

  it('formats readiness labels for UI', () => {
    expect(getReadinessStatusLabel('needs_work')).toBe('Needs Work');
    expect(getReadinessStatusLabel('improving')).toBe('Improving');
    expect(getReadinessStatusLabel('ready')).toBe('Ready');
    expect(getReadinessStatusLabel('not_enough_data')).toBe('Not Enough Data');
  });
});
