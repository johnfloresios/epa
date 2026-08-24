import {
  canAccessExamType,
  canAccessSectionBank,
  selectUniversalExamQuestions,
} from '@/utils/premiumAccess';
import { QuestionSummary } from '@/types/content';

describe('premium access', () => {
  it('keeps Core free and locks the other banks', () => {
    expect(canAccessSectionBank('CORE', false)).toBe(true);
    expect(canAccessSectionBank('TYPE_I', false)).toBe(false);
    expect(canAccessExamType('UNIVERSAL', false)).toBe(false);
    expect(canAccessExamType('TYPE_III', true)).toBe(true);
  });

  it('builds an evenly distributed Universal mock exam', () => {
    const codes = ['CORE', 'TYPE_I', 'TYPE_II', 'TYPE_III'] as const;
    const questions = codes.flatMap((sectionCode) =>
      Array.from({ length: 5 }, (_, index) => ({
        id: `${sectionCode}-${index}`,
        sectionId: sectionCode,
        topicId: null,
        sectionCode,
        sectionName: sectionCode,
        topicName: null,
        text: 'Question',
        difficulty: 'medium' as const,
        version: 1,
        reference: null,
      })),
    ) satisfies QuestionSummary[];

    const selected = selectUniversalExamQuestions(questions, 3);
    expect(selected).toHaveLength(12);
    for (const code of codes) {
      expect(selected.filter((question) => question.sectionCode === code)).toHaveLength(3);
    }
  });
});
