import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { examService } from '@/services/supabase/exam';
import { useAuthStore } from '@/store/useAuthStore';
import { ExamAnswerRecord, ExamAttemptHistoryDetail } from '@/types/exam';
import { translatePracticeError } from '@/utils/practiceErrors';

type Params = {
  attemptId?: string;
  answerId?: string;
};

type UseExamHistoryResult = {
  attemptDetail: ExamAttemptHistoryDetail | null;
  answerDetail: ExamAnswerRecord | null;
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

export const useExamHistory = ({
  attemptId,
  answerId,
}: Params): UseExamHistoryResult => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [attemptDetail, setAttemptDetail] = useState<ExamAttemptHistoryDetail | null>(null);
  const [answerDetail, setAnswerDetail] = useState<ExamAnswerRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = async (): Promise<void> => {
    if (!userId) {
      setAttemptDetail(null);
      setAnswerDetail(null);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const [nextAttemptDetail, nextAnswerDetail] = await Promise.all([
        attemptId ? examService.getExamAttemptDetail(userId, attemptId) : Promise.resolve(null),
        answerId ? examService.getExamAnswerDetail(userId, answerId) : Promise.resolve(null),
      ]);

      setAttemptDetail(nextAttemptDetail);
      setAnswerDetail(nextAnswerDetail);
    } catch (error) {
      setAttemptDetail(null);
      setAnswerDetail(null);
      setErrorMessage(translatePracticeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [answerId, attemptId, userId]),
  );

  return {
    attemptDetail,
    answerDetail,
    isLoading,
    errorMessage,
    refresh,
  };
};
