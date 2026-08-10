import { studyConfig } from '@/config/study';
import { CertificationSectionCode } from '@/types/content';
import { PerformanceMetric, WeakAreaItem, MissedQuestionSummary } from '@/types/review';
import {
  FocusedStudyPlan,
  ReadinessRecommendation,
  ReadinessStatus,
  ReadinessSummary,
  SectionReadiness,
} from '@/types/readiness';
import { formatSectionName } from '@/utils/sections';

const readinessOrder: ReadinessStatus[] = [
  'not_enough_data',
  'needs_work',
  'improving',
  'ready',
];

const sectionOrder: CertificationSectionCode[] = ['CORE', 'TYPE_I', 'TYPE_II', 'TYPE_III'];

const isCertificationSectionCode = (
  code: PerformanceMetric['sectionCode'],
): code is CertificationSectionCode => code !== 'UNIVERSAL';

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

export const getReadinessStatusLabel = (status: ReadinessStatus): string => {
  if (status === 'needs_work') {
    return 'Needs Work';
  }

  if (status === 'improving') {
    return 'Improving';
  }

  if (status === 'ready') {
    return 'Ready';
  }

  return 'Not Enough Data';
};

const downgradeReadiness = (status: ReadinessStatus): ReadinessStatus => {
  if (status === 'ready') {
    return 'improving';
  }

  if (status === 'improving') {
    return 'needs_work';
  }

  return status;
};

const getBaseReadinessStatus = (
  accuracy: number,
  answeredCount: number,
): ReadinessStatus => {
  if (answeredCount < studyConfig.readiness.minimumQuestionsPerSection) {
    return 'not_enough_data';
  }

  if (accuracy < studyConfig.readiness.weakAccuracyThreshold) {
    return 'needs_work';
  }

  if (accuracy < studyConfig.readiness.improvingAccuracyThreshold) {
    return 'improving';
  }

  return 'ready';
};

const buildSectionReadiness = (
  sectionPerformance: PerformanceMetric[],
  missedQuestions: MissedQuestionSummary[],
): SectionReadiness[] => {
  return sectionPerformance
    .filter(
      (metric): metric is PerformanceMetric & { sectionCode: CertificationSectionCode } =>
        metric.topicId === null && isCertificationSectionCode(metric.sectionCode),
    )
    .sort(
      (left, right) =>
        sectionOrder.indexOf(left.sectionCode) - sectionOrder.indexOf(right.sectionCode),
    )
    .map((metric) => {
      const repeatedMissCount = missedQuestions.filter(
        (question) =>
          question.sectionId === metric.sectionId &&
          question.incorrectCount >= studyConfig.readiness.repeatedMissThreshold,
      ).length;

      const status = repeatedMissCount > 0
        ? downgradeReadiness(
            getBaseReadinessStatus(metric.accuracy, metric.answeredCount),
          )
        : getBaseReadinessStatus(metric.accuracy, metric.answeredCount);

      return {
        sectionId: metric.sectionId,
        sectionCode: metric.sectionCode,
        sectionName: metric.sectionName,
        answeredCount: metric.answeredCount,
        accuracy: metric.accuracy,
        repeatedMissCount,
        recentExamAccuracy: null,
        status,
      };
    });
};

const buildRecommendation = (
  focusedStudyPlan: FocusedStudyPlan | null,
  weakestArea: WeakAreaItem | null,
  missedQuestions: MissedQuestionSummary[],
): ReadinessRecommendation => {
  if (focusedStudyPlan) {
    return {
      type: focusedStudyPlan.topicId ? 'practice_topic' : 'practice_section',
      title: focusedStudyPlan.title,
      description: focusedStudyPlan.description,
      sectionId: focusedStudyPlan.sectionId,
      topicId: focusedStudyPlan.topicId,
      questionIds: focusedStudyPlan.questionIds,
      focusReason: focusedStudyPlan.focusReason,
    };
  }

  const mostMissed = missedQuestions[0] ?? null;

  if (mostMissed) {
    return {
      type: 'review_missed',
      title: `Review ${formatSectionName(mostMissed.sectionCode)} missed questions`,
      description: `You have missed this section multiple times. Reinforce it before moving on.`,
      sectionId: mostMissed.sectionId,
      topicId: null,
      questionIds: [mostMissed.questionId],
      focusReason: `This section has repeated misses in your saved history.`,
    };
  }

  if (weakestArea) {
    return {
      type: weakestArea.topicId ? 'practice_topic' : 'practice_section',
      title: weakestArea.topicId
        ? `Practice ${weakestArea.sectionName} • ${weakestArea.topicName ?? 'Topic'}`
        : `Practice ${weakestArea.sectionName}`,
      description: weakestArea.topicId
        ? `${weakestArea.topicName ?? 'This topic'} is currently one of your weakest areas.`
        : `${weakestArea.sectionName} needs more reinforcement.`,
      sectionId: weakestArea.sectionId,
      topicId: weakestArea.topicId,
      questionIds: [],
      focusReason: `This area has lower saved accuracy than your stronger sections.`,
    };
  }

  return {
    type: 'build_history',
    title: 'Build your readiness',
    description: 'Complete more practice questions to unlock readiness insights.',
    sectionId: null,
    topicId: null,
    questionIds: [],
    focusReason: 'There is not enough saved history yet.',
  };
};

export const buildFocusedStudyPlan = ({
  sectionReadiness,
  weakAreas,
  missedQuestions,
  sectionQuestionIds,
  topicQuestionIds,
}: {
  sectionReadiness: SectionReadiness[];
  weakAreas: WeakAreaItem[];
  missedQuestions: MissedQuestionSummary[];
  sectionQuestionIds: string[];
  topicQuestionIds: string[];
}): FocusedStudyPlan | null => {
  const actionableTopic = weakAreas.find(
    (area) =>
      area.type === 'topic' &&
      (area.status === 'needs_attention' || area.status === 'developing'),
  ) ?? null;
  const actionableSection = sectionReadiness.find(
    (section) => section.status === 'needs_work' || section.status === 'improving',
  ) ?? null;

  const targetSectionId = actionableTopic?.sectionId ?? actionableSection?.sectionId ?? null;
  const targetTopicId = actionableTopic?.topicId ?? null;

  if (!targetSectionId) {
    return null;
  }

  const targetSection = sectionReadiness.find((section) => section.sectionId === targetSectionId);
  if (!targetSection) {
    return null;
  }

  const targetMissedQuestions = missedQuestions
    .filter((question) =>
      question.sectionId === targetSectionId &&
      (targetTopicId ? question.topicId === targetTopicId : true),
    )
    .sort(
      (left, right) =>
        right.incorrectCount - left.incorrectCount ||
        right.attemptsCount - left.attemptsCount,
    )
    .map((question) => question.questionId);

  const scopedQuestionIds = targetTopicId ? topicQuestionIds : sectionQuestionIds;
  const desiredCount = studyConfig.focusedStudy.sessionQuestionCount;
  const weakTopicCount = targetTopicId
    ? Math.max(1, Math.round(desiredCount * studyConfig.focusedStudy.weakTopicQuestionShare))
    : 0;
  const missedCount = Math.max(1, Math.round(desiredCount * studyConfig.focusedStudy.missedQuestionShare));
  const reinforcementCount = Math.max(
    1,
    desiredCount - weakTopicCount - missedCount,
  );

  const selectedIds = unique([
    ...scopedQuestionIds.slice(0, weakTopicCount),
    ...targetMissedQuestions.slice(0, missedCount),
    ...scopedQuestionIds.slice(weakTopicCount, weakTopicCount + reinforcementCount),
  ]).slice(0, desiredCount);

  if (selectedIds.length === 0) {
    return null;
  }

  const title = targetTopicId
    ? `Focused Study • ${targetSection.sectionName} • ${actionableTopic?.topicName ?? 'Topic'}`
    : `Focused Study • ${targetSection.sectionName}`;

  const description = targetTopicId
    ? `${actionableTopic?.topicName ?? 'This topic'} is one of your weakest areas right now.`
    : `${targetSection.sectionName} currently needs the most reinforcement.`;

  const focusReason = targetTopicId
    ? `Focus: ${targetSection.sectionName} • ${actionableTopic?.topicName ?? 'Topic'}\nYou have answered ${actionableTopic?.correctCount ?? 0} of ${actionableTopic?.answeredCount ?? 0} questions correctly in this topic.`
    : `Focus: ${targetSection.sectionName}\nYour saved accuracy in this section is ${Math.round(targetSection.accuracy * 100)}%.`;

  return {
    title,
    description,
    sectionId: targetSection.sectionId,
    topicId: targetTopicId,
    questionIds: selectedIds,
    focusReason,
  };
};

export const buildReadinessSummary = ({
  sectionPerformance,
  topicPerformance,
  weakAreas,
  missedQuestions,
  focusedStudyPlan,
}: {
  sectionPerformance: PerformanceMetric[];
  topicPerformance: PerformanceMetric[];
  weakAreas: WeakAreaItem[];
  missedQuestions: MissedQuestionSummary[];
  focusedStudyPlan: FocusedStudyPlan | null;
}): ReadinessSummary => {
  const sectionReadiness = buildSectionReadiness(sectionPerformance, missedQuestions);
  const totalQuestionsAnswered = sectionReadiness.reduce(
    (sum, section) => sum + section.answeredCount,
    0,
  );

  const hasEnoughDataForOverall =
    sectionReadiness.length === sectionOrder.length &&
    sectionReadiness.every((section) => section.status !== 'not_enough_data');

  const overallStatus = hasEnoughDataForOverall
    ? sectionReadiness.reduce<ReadinessStatus>((worst, section) => {
        return readinessOrder.indexOf(section.status) < readinessOrder.indexOf(worst)
          ? section.status
          : worst;
      }, 'ready')
    : 'not_enough_data';

  const overallDescription =
    overallStatus === 'not_enough_data'
      ? 'Complete more practice questions across all four EPA sections to estimate Universal readiness.'
      : overallStatus === 'needs_work'
        ? 'At least one EPA section still needs reinforcement before you should trust your study readiness.'
        : overallStatus === 'improving'
          ? 'Your section results are trending upward, but at least one area still needs more work.'
          : 'All four EPA sections currently meet your app readiness thresholds.';

  const weakestTopics = topicPerformance
    .filter(
      (metric): metric is PerformanceMetric & { sectionCode: CertificationSectionCode } =>
        isCertificationSectionCode(metric.sectionCode),
    )
    .filter((metric) => metric.answeredCount >= studyConfig.minimumAnswersForWeakArea)
    .sort((left, right) => left.accuracy - right.accuracy || right.answeredCount - left.answeredCount)
    .slice(0, 3)
    .map((metric) => ({
      sectionId: metric.sectionId,
      sectionCode: metric.sectionCode,
      sectionName: metric.sectionName,
      topicId: metric.topicId,
      topicName: metric.topicName,
      answeredCount: metric.answeredCount,
      accuracy: metric.accuracy,
    }));

  const weakestArea =
    weakAreas.find(
      (area) => area.status === 'needs_attention' || area.status === 'developing',
    ) ?? null;

  return {
    overallStatus,
    overallLabel: getReadinessStatusLabel(overallStatus),
    overallDescription,
    totalQuestionsAnswered,
    sectionReadiness,
    weakestTopics,
    recentExamPerformance: {
      hasExamHistory: false,
      message: 'Saved exam performance is not yet included in readiness insights.',
    },
    recommendation: buildRecommendation(focusedStudyPlan, weakestArea, missedQuestions),
    focusedStudyPlan,
  };
};
