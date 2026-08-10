export const readinessRequirements = {
  minimumPracticeQuestions: 50,
  minimumPracticeAccuracy: 0.8,
  requirePassingPracticeExam: true,
  passingPracticeExamScore: 0.7,
  timedPracticeExamMinutes: 60,
} as const;

export const studyConfig = {
  examPassingScore: readinessRequirements.passingPracticeExamScore,
  minimumAnswersForWeakArea: 5,
  masteryThresholds: {
    needsAttention: 0.7,
    developing: 0.85,
  },
  missedQuestionsPracticeLimit: 10,
  // Product-defined study thresholds only. These are not official EPA standards.
  readiness: {
    minimumQuestionsPerSection: 20,
    weakAccuracyThreshold: 0.7,
    improvingAccuracyThreshold: 0.85,
    repeatedMissThreshold: 3,
  },
  focusedStudy: {
    sessionQuestionCount: 10,
    weakTopicQuestionShare: 0.4,
    missedQuestionShare: 0.3,
    reinforcementQuestionShare: 0.3,
  },
} as const;
