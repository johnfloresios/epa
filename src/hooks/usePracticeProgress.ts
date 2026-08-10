import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { practiceService } from '@/services/supabase/practice';
import { useAuthStore } from '@/store/useAuthStore';
import { PracticeProgressSummary } from '@/types/practice';
import { translatePracticeError } from '@/utils/practiceErrors';
import { createEmptyPracticeProgressSummary } from '@/utils/practiceProgress';

type UsePracticeProgressResult = {
  summary: PracticeProgressSummary;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

export const usePracticeProgress = (): UsePracticeProgressResult => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [summary, setSummary] = useState<PracticeProgressSummary>(
    createEmptyPracticeProgressSummary(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    if (!userId) {
      setSummary(createEmptyPracticeProgressSummary());
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const nextSummary = await practiceService.getProgressSummary(userId);
      setSummary(nextSummary);
    } catch (error) {
      setErrorMessage(translatePracticeError(error));
      setSummary(createEmptyPracticeProgressSummary());
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
