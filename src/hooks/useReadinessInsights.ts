import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { reviewService } from '@/services/supabase/review';
import { FocusedStudyPlan, ReadinessSummary } from '@/types/readiness';
import { translatePracticeError } from '@/utils/practiceErrors';

const emptyReadiness: ReadinessSummary = {
  overallStatus: 'not_enough_data',
  overallLabel: 'Not Enough Data',
  overallDescription: 'Complete more practice questions to estimate readiness.',
  totalQuestionsAnswered: 0,
  sectionReadiness: [],
  weakestTopics: [],
  recentExamPerformance: {
    hasExamHistory: false,
    message: 'Saved exam performance is not yet included in readiness insights.',
  },
  recommendation: {
    type: 'build_history',
    title: 'Build your readiness',
    description: 'Complete more practice questions to unlock readiness insights.',
    sectionId: null,
    topicId: null,
    questionIds: [],
    focusReason: 'There is not enough saved history yet.',
  },
  focusedStudyPlan: null,
};

type UseReadinessInsightsResult = {
  readiness: ReadinessSummary;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

export const useReadinessInsights = (): UseReadinessInsightsResult => {
  const [readiness, setReadiness] = useState<ReadinessSummary>(emptyReadiness);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const nextReadiness = await reviewService.getReadinessSummary();
      setReadiness(nextReadiness);
    } catch (error) {
      setReadiness(emptyReadiness);
      setErrorMessage(translatePracticeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, []),
  );

  return {
    readiness,
    isLoading,
    errorMessage,
    refresh,
  };
};

export const buildFocusedStudyParams = (
  plan: FocusedStudyPlan | null,
):
  | {
      presetSectionId: string;
      presetTopicId?: string | null;
      presetQuestionIds: string[];
      presetTitle: string;
      presetCount: 'all';
      autoStart: true;
      focusReason: string;
    }
  | null => {
  if (!plan) {
    return null;
  }

  return {
    presetSectionId: plan.sectionId,
    presetTopicId: plan.topicId,
    presetQuestionIds: plan.questionIds,
    presetTitle: plan.title,
    presetCount: 'all',
    autoStart: true,
    focusReason: plan.focusReason,
  };
};
