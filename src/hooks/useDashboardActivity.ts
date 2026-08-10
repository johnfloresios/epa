import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { practiceService } from '@/services/supabase/practice';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardActivitySummary } from '@/types/practice';
import { translatePracticeError } from '@/utils/practiceErrors';

const emptySummary: DashboardActivitySummary = {
  overallAccuracy: 0,
  questionsAnswered: 0,
  practiceSessions: 0,
  examAttempts: 0,
  recentActivity: [],
  passedExamSectionCodes: [],
  sectionReadiness: [],
};

type UseDashboardActivityResult = {
  summary: DashboardActivitySummary;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

export const useDashboardActivity = (): UseDashboardActivityResult => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [summary, setSummary] = useState<DashboardActivitySummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    if (!userId) {
      setSummary(emptySummary);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const nextSummary = await practiceService.getDashboardSummary(userId, 8);
      setSummary(nextSummary);
    } catch (error) {
      setSummary(emptySummary);
      setErrorMessage(translatePracticeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [userId]),
  );

  return {
    summary,
    isLoading,
    errorMessage,
    refresh,
  };
};
