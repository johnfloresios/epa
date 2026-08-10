import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { reviewService } from '@/services/supabase/review';
import { MissedQuestionDetail, ReviewInsightsSummary } from '@/types/review';
import { translatePracticeError } from '@/utils/practiceErrors';

const emptyInsights: ReviewInsightsSummary = {
  sectionPerformance: [],
  topicPerformance: [],
  weakAreas: [],
  missedQuestions: [],
};

type UseReviewInsightsResult = {
  insights: ReviewInsightsSummary;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

export const useReviewInsights = (): UseReviewInsightsResult => {
  const [insights, setInsights] = useState<ReviewInsightsSummary>(emptyInsights);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const nextInsights = await reviewService.getReviewInsights();
      setInsights(nextInsights);
    } catch (error) {
      setInsights(emptyInsights);
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
    insights,
    isLoading,
    errorMessage,
    refresh,
  };
};

type UseMissedQuestionDetailResult = {
  detail: MissedQuestionDetail | null;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

export const useMissedQuestionDetail = (
  questionId: string,
): UseMissedQuestionDetailResult => {
  const [detail, setDetail] = useState<MissedQuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const nextDetail = await reviewService.getMissedQuestionDetail(questionId);
      setDetail(nextDetail);
    } catch (error) {
      setDetail(null);
      setErrorMessage(translatePracticeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [questionId]),
  );

  return {
    detail,
    isLoading,
    errorMessage,
    refresh,
  };
};
