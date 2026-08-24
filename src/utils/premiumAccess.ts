import { ActivitySectionCode, CertificationSectionCode, QuestionSummary } from '@/types/content';

export const canAccessSectionBank = (
  sectionCode: CertificationSectionCode,
  hasPremium: boolean,
): boolean => sectionCode === 'CORE' || hasPremium;

export const canAccessExamType = (
  examType: ActivitySectionCode,
  hasPremium: boolean,
): boolean => examType === 'CORE' || hasPremium;

export const selectRandomQuestions = <T,>(questions: T[], count: number): T[] => {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
};

export const selectUniversalExamQuestions = (
  questions: QuestionSummary[],
  perSection: number,
): QuestionSummary[] => {
  const sectionCodes: CertificationSectionCode[] = ['CORE', 'TYPE_I', 'TYPE_II', 'TYPE_III'];
  return selectRandomQuestions(
    sectionCodes.flatMap((code) =>
      selectRandomQuestions(
        questions.filter((question) => question.sectionCode === code),
        perSection,
      ),
    ),
    perSection * sectionCodes.length,
  );
};
