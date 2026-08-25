import { buildDashboardSectionReadiness } from '@/utils/dashboardReadiness';

const practiceResults = (sectionCode: 'CORE' | 'TYPE_I' | 'TYPE_II' | 'TYPE_III', total: number, correct: number) =>
  Array.from({ length: total }, (_, index) => ({ sectionCode, isCorrect: index < correct }));

describe('buildDashboardSectionReadiness', () => {
  it('marks every section not ready for a new user', () => {
    const result = buildDashboardSectionReadiness([], []);

    expect(result).toHaveLength(4);
    expect(result.every((section) => !section.hasStarted)).toBe(true);
    expect(result.every((section) => !section.isReady)).toBe(true);
    expect(result.every((section) => section.nextStep === 'practice_count')).toBe(true);
  });

  it('marks a section started after practice or an exam attempt', () => {
    const result = buildDashboardSectionReadiness(
      practiceResults('CORE', 1, 1),
      [{ sectionCode: 'TYPE_II', score: 0.4 }],
    );

    expect(result.find((section) => section.sectionCode === 'CORE')?.hasStarted).toBe(true);
    expect(result.find((section) => section.sectionCode === 'TYPE_II')?.hasStarted).toBe(true);
    expect(result.find((section) => section.sectionCode === 'TYPE_I')?.hasStarted).toBe(false);
  });

  it('recommends the exam when Core practice requirements are complete', () => {
    const [core] = buildDashboardSectionReadiness(practiceResults('CORE', 50, 40), []);

    expect(core.completedStepCount).toBe(2);
    expect(core.isReady).toBe(false);
    expect(core.nextStep).toBe('practice_exam');
  });

  it('marks a section ready only when all three requirements are complete', () => {
    const result = buildDashboardSectionReadiness(
      practiceResults('TYPE_I', 50, 40),
      [{ sectionCode: 'TYPE_I', score: 0.7 }],
    );
    const typeI = result.find((section) => section.sectionCode === 'TYPE_I');

    expect(typeI?.isReady).toBe(true);
    expect(typeI?.nextStep).toBe('complete');
  });

  it('does not complete locked steps out of order', () => {
    const result = buildDashboardSectionReadiness(
      practiceResults('CORE', 20, 20),
      [{ sectionCode: 'CORE', score: 1 }],
    );
    const [core] = result;

    expect(core.practiceAccuracy).toBe(1);
    expect(core.hasMinimumPracticeQuestions).toBe(false);
    expect(core.hasMinimumPracticeAccuracy).toBe(false);
    expect(core.hasPassedPracticeExam).toBe(false);
    expect(core.completedStepCount).toBe(0);
    expect(core.nextStep).toBe('practice_count');
  });

  it('calculates mixed sections independently', () => {
    const result = buildDashboardSectionReadiness(
      [
        ...practiceResults('CORE', 50, 45),
        ...practiceResults('TYPE_I', 20, 18),
        ...practiceResults('TYPE_II', 50, 30),
        ...practiceResults('TYPE_III', 60, 50),
      ],
      [
        { sectionCode: 'CORE', score: 0.8 },
        { sectionCode: 'TYPE_III', score: 0.9 },
      ],
    );

    expect(result.map((section) => section.isReady)).toEqual([true, false, false, true]);
    expect(result.map((section) => section.nextStep)).toEqual([
      'complete',
      'practice_count',
      'practice_accuracy',
      'complete',
    ]);
  });
});
