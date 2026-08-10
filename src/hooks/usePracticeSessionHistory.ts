import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { practiceService } from '@/services/supabase/practice';
import { useAuthStore } from '@/store/useAuthStore';
import { PracticeAnswerRecord, PracticeSessionHistoryDetail } from '@/types/practice';
import { translatePracticeError } from '@/utils/practiceErrors';

type UsePracticeSessionHistoryResult = {
  sessionDetail: PracticeSessionHistoryDetail | null;
  answerDetail: PracticeAnswerRecord | null;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

type Params = {
  sessionId?: string;
  answerId?: string;
};

export const usePracticeSessionHistory = ({
  sessionId,
  answerId,
}: Params): UsePracticeSessionHistoryResult => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [sessionDetail, setSessionDetail] = useState<PracticeSessionHistoryDetail | null>(null);
  const [answerDetail, setAnswerDetail] = useState<PracticeAnswerRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    if (!userId) {
      setSessionDetail(null);
      setAnswerDetail(null);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const [nextSessionDetail, nextAnswerDetail] = await Promise.all([
        sessionId ? practiceService.getPracticeSessionDetail(userId, sessionId) : Promise.resolve(null),
        answerId ? practiceService.getPracticeAnswerDetail(userId, answerId) : Promise.resolve(null),
      ]);

      setSessionDetail(nextSessionDetail);
      setAnswerDetail(nextAnswerDetail);
    } catch (error) {
      setSessionDetail(null);
      setAnswerDetail(null);
      setErrorMessage(translatePracticeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [answerId, sessionId, userId]),
  );

  return {
    sessionDetail,
    answerDetail,
    isLoading,
    errorMessage,
    refresh,
  };
};
