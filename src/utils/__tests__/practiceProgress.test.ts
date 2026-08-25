import {
  buildSectionPerformanceItems,
  calculateAccuracy,
  formatPracticeActivityTimestamp,
  formatAccuracyPercentage,
  formatPracticeSessionDate,
} from '@/utils/practiceProgress';

describe('practiceProgress utilities', () => {
  it('includes sections with no recorded answers', () => {
    const sections = [
      { id: 'core', name: 'Core' },
      { id: 'type-1', name: 'Type I' },
      { id: 'type-2', name: 'Type II' },
      { id: 'type-3', name: 'Type III' },
    ];
    const groups = new Map([
      ['core', { correctCount: 8, answeredCount: 10 }],
      ['type-1', { correctCount: 6, answeredCount: 10 }],
      ['type-3', { correctCount: 9, answeredCount: 10 }],
    ]);

    expect(buildSectionPerformanceItems(sections, groups)).toEqual([
      { id: 'core', label: 'Core', accuracy: 0.8, correctCount: 8, answeredCount: 10 },
      { id: 'type-1', label: 'Type I', accuracy: 0.6, correctCount: 6, answeredCount: 10 },
      { id: 'type-2', label: 'Type II', accuracy: 0, correctCount: 0, answeredCount: 0 },
      { id: 'type-3', label: 'Type III', accuracy: 0.9, correctCount: 9, answeredCount: 10 },
    ]);
  });

  it('calculates accuracy safely for zero answers', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('calculates accuracy for answered questions', () => {
    expect(calculateAccuracy(8, 10)).toBe(0.8);
  });

  it('formats accuracy as a rounded percentage', () => {
    expect(formatAccuracyPercentage(0.756)).toBe('76%');
  });

  it('formats recent dates as today or yesterday', () => {
    const now = new Date('2026-08-10T12:00:00.000Z');

    expect(formatPracticeSessionDate('2026-08-10T08:00:00.000Z', now)).toBe('Today');
    expect(formatPracticeSessionDate('2026-08-09T08:00:00.000Z', now)).toBe('Yesterday');
  });

  it('formats same-day activity with time', () => {
    const now = new Date('2026-08-10T12:00:00.000Z');

    expect(formatPracticeActivityTimestamp('2026-08-10T08:42:00.000Z', now)).toContain('Today,');
  });
});
