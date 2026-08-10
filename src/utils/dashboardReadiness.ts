import { readinessRequirements } from '@/config/study';
import { CertificationSectionCode } from '@/types/content';
import { DashboardSectionReadiness } from '@/types/practice';

type PracticeResult = {
  sectionCode: CertificationSectionCode;
  isCorrect: boolean;
};

type ExamResult = {
  sectionCode: CertificationSectionCode;
  score: number;
};

export const certificationSectionCodes: CertificationSectionCode[] = [
  'CORE',
  'TYPE_I',
  'TYPE_II',
  'TYPE_III',
];

export const buildDashboardSectionReadiness = (
  practiceResults: PracticeResult[],
  examResults: ExamResult[],
): DashboardSectionReadiness[] =>
  certificationSectionCodes.map((sectionCode) => {
    const sectionPractice = practiceResults.filter((result) => result.sectionCode === sectionCode);
    const practiceAnsweredCount = sectionPractice.length;
    const practiceCorrectCount = sectionPractice.filter((result) => result.isCorrect).length;
    const practiceAccuracy = practiceAnsweredCount === 0
      ? 0
      : practiceCorrectCount / practiceAnsweredCount;
    const hasMinimumPracticeQuestions =
      practiceAnsweredCount >= readinessRequirements.minimumPracticeQuestions;
    const hasMinimumPracticeAccuracy =
      hasMinimumPracticeQuestions &&
      practiceAccuracy >= readinessRequirements.minimumPracticeAccuracy;
    const hasRecordedPassingPracticeExam = examResults.some(
      (result) =>
        result.sectionCode === sectionCode &&
        result.score >= readinessRequirements.passingPracticeExamScore,
    );
    const hasPassedPracticeExam =
      hasMinimumPracticeAccuracy && hasRecordedPassingPracticeExam;
    const examRequirementComplete =
      !readinessRequirements.requirePassingPracticeExam || hasPassedPracticeExam;
    const isReady =
      hasMinimumPracticeQuestions && hasMinimumPracticeAccuracy && examRequirementComplete;
    const completedStepCount = [
      hasMinimumPracticeQuestions,
      hasMinimumPracticeAccuracy,
      examRequirementComplete,
    ].filter(Boolean).length;
    const nextStep = !hasMinimumPracticeQuestions
      ? 'practice_count'
      : !hasMinimumPracticeAccuracy
        ? 'practice_accuracy'
        : !examRequirementComplete
          ? 'practice_exam'
          : 'complete';

    return {
      sectionCode,
      practiceAnsweredCount,
      practiceCorrectCount,
      practiceAccuracy,
      hasMinimumPracticeQuestions,
      hasMinimumPracticeAccuracy,
      hasPassedPracticeExam,
      isReady,
      completedStepCount,
      nextStep,
    };
  });
