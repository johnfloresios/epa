import {
  calculateAccuracy,
  formatPracticeActivityTimestamp,
  formatAccuracyPercentage,
  formatPracticeSessionDate,
} from '@/utils/practiceProgress';

describe('practiceProgress utilities', () => {
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
