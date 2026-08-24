import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ProgressIndicator, ScreenContainer, Text } from '@/components';
import { readinessRequirements } from '@/config/study';
import { premiumConfig } from '@/config/premium';
import { useDashboardActivity } from '@/hooks/useDashboardActivity';
import { contentService } from '@/services/supabase/content';
import { examService } from '@/services/supabase/exam';
import { useAuthStore } from '@/store/useAuthStore';
import { usePremiumStore } from '@/store/usePremiumStore';
import { ActivitySectionCode, CertificationSection, QuestionDetail, QuestionSummary } from '@/types/content';
import { AppTabParamList, ExamsStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/theme/ThemeContext';
import { translateContentError } from '@/utils/contentErrors';
import {
  formatAccuracyPercentage,
  formatPracticeActivityTimestamp,
} from '@/utils/practiceProgress';
import { translatePracticeError } from '@/utils/practiceErrors';
import { formatSectionBadge } from '@/utils/sections';
import {
  canAccessExamType,
  selectRandomQuestions,
  selectUniversalExamQuestions,
} from '@/utils/premiumAccess';

type Props = NativeStackScreenProps<ExamsStackParamList, 'ExamsHome'>;

type ExamSessionState = {
  attemptId: string;
  examType: ActivitySectionCode;
  sectionId: string | null;
  sectionName: string;
  questions: QuestionDetail[];
  currentQuestionIndex: number;
  selectedChoiceIds: Record<string, string>;
  expiresAt: number;
};

const formatTimeRemaining = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

export const ExamsScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const hasPremium = usePremiumStore((state) => state.hasPremium);
  const showPaywall = usePremiumStore((state) => state.showPaywall);
  const {
    summary: dashboardSummary,
    isLoading: isLoadingReadiness,
    errorMessage: readinessErrorMessage,
    refresh: refreshReadiness,
  } = useDashboardActivity();
  const [sections, setSections] = useState<CertificationSection[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<ActivitySectionCode>('CORE');
  const [availableQuestions, setAvailableQuestions] = useState<QuestionSummary[]>([]);
  const [sessionState, setSessionState] = useState<ExamSessionState | null>(null);
  const [isExamComplete, setIsExamComplete] = useState(false);
  const [resultSummary, setResultSummary] = useState<{
    correctCount: number;
    answeredCount: number;
    scorePercent: number;
    completedAt: string;
  } | null>(null);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(
    readinessRequirements.timedPracticeExamMinutes * 60,
  );
  const isSavingAnswerRef = useRef(false);
  const isSubmittingExamRef = useRef(false);
  const submitExamRef = useRef<() => Promise<void>>(async () => undefined);

  const currentQuestion =
    sessionState?.questions[sessionState.currentQuestionIndex] ?? null;
  const selectedChoiceId = currentQuestion
    ? sessionState?.selectedChoiceIds[currentQuestion.id] ?? null
    : null;
  const progress =
    sessionState && sessionState.questions.length > 0
      ? (sessionState.currentQuestionIndex + 1) / sessionState.questions.length
      : 0;
  const hasPreviousQuestion = Boolean(sessionState && sessionState.currentQuestionIndex > 0);
  const hasNextQuestion = Boolean(
    sessionState && sessionState.currentQuestionIndex < sessionState.questions.length - 1,
  );
  const currentSection = sections.find((section) => section.code === selectedExamType) ?? null;
  const selectedReadiness = selectedExamType === 'UNIVERSAL'
    ? null
    : dashboardSummary.sectionReadiness.find(
        (readiness) => readiness.sectionCode === selectedExamType,
      ) ?? null;
  const meetsStudyRequirements = selectedExamType === 'UNIVERSAL'
    ? dashboardSummary.sectionReadiness.length === 4 &&
      dashboardSummary.sectionReadiness.every(
        (readiness) => readiness.hasMinimumPracticeAccuracy,
      )
    : Boolean(selectedReadiness?.hasMinimumPracticeAccuracy);
  const hasSelectedExamAccess = canAccessExamType(selectedExamType, hasPremium);
  const isSelectedExamUnlocked = hasSelectedExamAccess && meetsStudyRequirements;

  const examOptions = useMemo(
    () => [
      ...sections.map((section) => ({
        code: section.code as ActivitySectionCode,
        title: section.name,
        description: section.description ?? `${section.name} section exam`,
        isUnlocked: Boolean(
          canAccessExamType(section.code, hasPremium) && dashboardSummary.sectionReadiness.find(
            (readiness) => readiness.sectionCode === section.code,
          )?.hasMinimumPracticeAccuracy,
        ),
      })),
      {
        code: 'UNIVERSAL' as const,
        title: 'Universal',
        description: 'Mixed exam across Core, Type I, Type II, and Type III questions.',
        isUnlocked:
          hasPremium &&
          dashboardSummary.sectionReadiness.length === 4 &&
          dashboardSummary.sectionReadiness.every(
            (readiness) => readiness.hasMinimumPracticeAccuracy,
          ),
      },
    ],
    [dashboardSummary.sectionReadiness, hasPremium, sections],
  );

  useEffect(() => {
    if (route.params?.presetExamType && route.params.presetExamType !== selectedExamType) {
      setSelectedExamType(route.params.presetExamType);
    }
  }, [route.params?.presetExamType, selectedExamType]);

  const loadSections = async (): Promise<void> => {
    try {
      setIsLoadingSections(true);
      setErrorMessage('');
      const data = await contentService.getCertificationSections();
      setSections(data);
      setSelectedExamType((current) =>
        current === 'UNIVERSAL' || data.some((section) => section.code === current)
          ? current
          : (data[0]?.code as ActivitySectionCode) ?? 'CORE',
      );
    } catch (error) {
      setErrorMessage(translateContentError(error));
    } finally {
      setIsLoadingSections(false);
    }
  };

  const loadAvailableQuestions = async (examType: ActivitySectionCode): Promise<void> => {
    try {
      setIsLoadingQuestions(true);
      setErrorMessage('');
      const selectedSection = sections.find((section) => section.code === examType) ?? null;

      const questions =
        examType === 'UNIVERSAL'
          ? await contentService.getQuestionsBySectionIds(sections.map((section) => section.id))
          : selectedSection
            ? await contentService.getQuestionsBySection(selectedSection.id)
            : [];

      setAvailableQuestions(questions);
    } catch (error) {
      setAvailableQuestions([]);
      setErrorMessage(translateContentError(error));
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    void loadAvailableQuestions(selectedExamType);
  }, [currentSection?.id, sections, selectedExamType]);

  useEffect(() => {
    tabNavigation?.setOptions({
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        display: sessionState && !isExamComplete ? 'none' : 'flex',
        height: 72,
        paddingBottom: 10,
        paddingTop: 8,
      },
    });

    return () => {
      tabNavigation?.setOptions({
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
      });
    };
  }, [isExamComplete, sessionState, tabNavigation, theme.colors.border, theme.colors.surface]);

  useEffect(() => {
    const hasActiveExam = Boolean(sessionState) && !isExamComplete;

    if (!hasActiveExam) {
      return undefined;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();

      Alert.alert('Leave Exam?', 'Your in-progress exam will be abandoned.', [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setSessionState(null);
            setIsExamComplete(false);
            setResultSummary(null);
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });

    return unsubscribe;
  }, [isExamComplete, navigation, sessionState]);

  const startExam = async (): Promise<void> => {
    if (!hasSelectedExamAccess) {
      showPaywall();
      return;
    }

    if (!userId || availableQuestions.length === 0 || !isSelectedExamUnlocked) {
      return;
    }

    try {
      setIsStartingExam(true);
      setErrorMessage('');
      const sectionId = selectedExamType === 'UNIVERSAL' ? null : currentSection?.id ?? null;
      const selectedQuestions = selectedExamType === 'UNIVERSAL'
        ? selectUniversalExamQuestions(
            availableQuestions,
            premiumConfig.universalExamQuestionsPerSection,
          )
        : selectRandomQuestions(availableQuestions, premiumConfig.sectionExamQuestionCount);
      const questionIds = selectedQuestions.map((question) => question.id);
      const details = await contentService.getQuestionDetailsByIds(questionIds);

      if (details.length === 0) {
        setErrorMessage('No exam questions are available for this selection right now.');
        return;
      }

      const attempt = await examService.createAttempt({
        userId,
        examType: selectedExamType,
        sectionId,
        questionCount: details.length,
      });

      setSessionState({
        attemptId: attempt.id,
        examType: selectedExamType,
        sectionId,
        sectionName: selectedExamType === 'UNIVERSAL' ? 'Universal' : currentSection?.name ?? 'Exam',
        questions: details.map((question) => ({
          ...question,
          choices: shuffleArray(question.choices),
        })),
        currentQuestionIndex: 0,
        selectedChoiceIds: {},
        expiresAt:
          Date.now() + readinessRequirements.timedPracticeExamMinutes * 60 * 1000,
      });
      setSecondsRemaining(readinessRequirements.timedPracticeExamMinutes * 60);
      setIsExamComplete(false);
      setResultSummary(null);
    } catch (error) {
      setErrorMessage(translatePracticeError(error));
    } finally {
      setIsStartingExam(false);
    }
  };

  const handleSelectChoice = async (choiceId: string): Promise<void> => {
    if (
      isSavingAnswerRef.current ||
      !sessionState ||
      !currentQuestion ||
      !userId
    ) {
      return;
    }

    const selectedChoice = currentQuestion.choices.find((choice) => choice.id === choiceId);
    const correctChoice = currentQuestion.choices.find((choice) => choice.isCorrect);

    if (!selectedChoice) {
      return;
    }

    setSessionState((current) =>
      current
        ? {
            ...current,
            selectedChoiceIds: {
              ...current.selectedChoiceIds,
              [currentQuestion.id]: choiceId,
            },
          }
        : current,
    );

    try {
      isSavingAnswerRef.current = true;
      setIsSavingAnswer(true);

      await examService.saveAnswer({
        examAttemptId: sessionState.attemptId,
        userId,
        sectionId: currentQuestion.sectionId,
        topicId: currentQuestion.topicId,
        questionOrder: sessionState.currentQuestionIndex + 1,
        sectionCode: currentQuestion.sectionCode,
        sectionName: currentQuestion.sectionName,
        topicName: currentQuestion.topicName,
        questionId: currentQuestion.id,
        questionVersion: currentQuestion.version,
        questionText: currentQuestion.text,
        explanation: currentQuestion.explanation,
        selectedChoiceId: selectedChoice.id,
        selectedChoiceText: selectedChoice.text,
        correctChoiceId: correctChoice?.id ?? null,
        correctChoiceText: correctChoice?.text ?? null,
        isCorrect: selectedChoice.isCorrect,
      });
    } catch (error) {
      Alert.alert('Unable to save your exam answer', translatePracticeError(error));
    } finally {
      isSavingAnswerRef.current = false;
      setIsSavingAnswer(false);
    }
  };

  const handleSubmitExam = async (): Promise<void> => {
    if (isSubmittingExamRef.current || !sessionState || !userId) {
      return;
    }

    try {
      isSubmittingExamRef.current = true;
      setIsSubmittingExam(true);

      const answeredQuestions = sessionState.questions.filter(
        (question) => Boolean(sessionState.selectedChoiceIds[question.id]),
      );
      const correctCount = answeredQuestions.filter((question) => {
        const selectedId = sessionState.selectedChoiceIds[question.id];
        return question.choices.some((choice) => choice.id === selectedId && choice.isCorrect);
      }).length;
      const answeredCount = answeredQuestions.length;
      const scorePercent = answeredCount === 0 ? 0 : correctCount / answeredCount;
      const completedAt = new Date().toISOString();

      await examService.completeAttempt({
        examAttemptId: sessionState.attemptId,
        userId,
        questionCount: sessionState.questions.length,
        answeredCount,
        correctCount,
        scorePercent,
        completedAt,
      });

      setResultSummary({
        correctCount,
        answeredCount,
        scorePercent,
        completedAt,
      });
      setIsExamComplete(true);
    } catch (error) {
      Alert.alert('Unable to submit exam', translatePracticeError(error));
    } finally {
      isSubmittingExamRef.current = false;
      setIsSubmittingExam(false);
    }
  };

  submitExamRef.current = handleSubmitExam;

  useEffect(() => {
    if (!sessionState || isExamComplete) {
      return undefined;
    }

    const updateTimer = (): void => {
      const remaining = Math.max(0, Math.ceil((sessionState.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining === 0 && !isSubmittingExamRef.current) {
        void submitExamRef.current();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isExamComplete, sessionState?.attemptId, sessionState?.expiresAt]);

  const handleRestart = (): void => {
    setSessionState(null);
    setIsExamComplete(false);
    setResultSummary(null);
    setSecondsRemaining(readinessRequirements.timedPracticeExamMinutes * 60);
  };

  const renderSetup = (): React.JSX.Element => (
    <>
      {!route.params?.presetExamType ? (
        <Card style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold">
            Choose an Exam
          </Text>
          <Text tone="muted">
            Select a section exam or build a Universal exam from all four EPA sections.
          </Text>
          <View style={styles.optionList}>
            {examOptions.map((option) => {
              const isActive = option.code === selectedExamType;
              const requiresPremium = !canAccessExamType(option.code, hasPremium);

              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.title} exam. ${option.isUnlocked ? 'Unlocked' : 'Locked'}.`}
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setSelectedExamType(option.code)}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      borderRadius: theme.radius.lg,
                      backgroundColor: isActive
                        ? theme.colors.primaryMuted
                        : theme.colors.surface,
                    },
                  ]}
                >
                  <Text weight="semibold">{`${option.title}${requiresPremium ? ' • Premium' : ''}`}</Text>
                  <Text tone="muted">{option.description}</Text>
                  <Text
                    tone={isActive ? 'primary' : 'muted'}
                    variant="caption"
                    weight="semibold"
                  >
                    {!option.isUnlocked
                      ? isActive
                        ? 'Selected • Locked'
                        : 'Tap to view unlock requirements'
                      : isActive
                        ? 'Selected Exam'
                        : 'Tap to use this exam'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ) : null}

      <Card style={styles.sectionCard}>
        <Text variant="subheading" weight="semibold">
          {`${selectedExamType === 'UNIVERSAL' ? 'Universal' : currentSection?.name ?? 'Section'} Exam`}
        </Text>
        {isLoadingSections || isLoadingQuestions || isLoadingReadiness ? (
          <Text tone="muted">Loading available exam questions...</Text>
        ) : readinessErrorMessage ? (
          <>
            <Text tone="error" weight="semibold">{readinessErrorMessage}</Text>
            <Button onPress={() => void refreshReadiness()} title="Retry Readiness" />
          </>
        ) : !hasSelectedExamAccess ? (
          <>
            <Text tone="primary" weight="bold">PREMIUM REQUIRED</Text>
            <Text tone="muted">
              Premium unlocks Type I, Type II, Type III, and Universal mock exams.
            </Text>
            <Button onPress={showPaywall} title="View Premium" />
          </>
        ) : !isSelectedExamUnlocked ? (
          <>
            <Text tone="error" weight="bold">LOCKED</Text>
            <Text weight="semibold">Timed exam unavailable</Text>
            <Text tone="muted">
              {selectedExamType === 'UNIVERSAL'
                ? 'Complete the practice-question and accuracy steps for all four sections first.'
                : `Answer ${readinessRequirements.minimumPracticeQuestions} practice questions and reach ${Math.round(readinessRequirements.minimumPracticeAccuracy * 100)}% accuracy in this section first.`}
            </Text>
          </>
        ) : availableQuestions.length === 0 ? (
          <>
            <Text variant="subheading" weight="semibold">
              No questions available
            </Text>
            <Text tone="muted">
              There are no active exam questions for this selection yet.
            </Text>
            <Button fullWidth={false} onPress={() => void loadSections()} title="Retry" variant="ghost" />
          </>
        ) : (
          <>
            <Text tone="success" weight="bold">UNLOCKED</Text>
            <Text tone="muted">
              {selectedExamType === 'UNIVERSAL'
                ? `${premiumConfig.universalExamQuestionsPerSection * 4} randomized questions: ${premiumConfig.universalExamQuestionsPerSection} from each section.`
                : `${Math.min(availableQuestions.length, premiumConfig.sectionExamQuestionCount)} randomized questions in this timed exam.`}
            </Text>
            <Button
              loading={isStartingExam}
              onPress={() => {
                void startExam();
              }}
              title="Start Exam"
            />
          </>
        )}
      </Card>
    </>
  );

  const renderActiveExam = (): React.JSX.Element | null => {
    if (!sessionState || !currentQuestion) {
      return null;
    }

    return (
      <Card style={styles.sectionCard}>
        <View style={styles.metaRow}>
          <View style={styles.metaGroup}>
            <Text variant="subheading" weight="semibold">
              {`${sessionState.sectionName} Timed Exam`}
            </Text>
            <Text tone="muted" variant="caption">
              {selectedExamType === 'UNIVERSAL'
                ? 'Questions are mixed across all four EPA sections.'
                : 'Select your best answer for each question before submitting.'}
            </Text>
          </View>
          <View style={styles.timerGroup}>
            <Text
              accessibilityLabel={`${formatTimeRemaining(secondsRemaining)} remaining in timed exam`}
              tone={secondsRemaining <= 300 ? 'error' : 'primary'}
              weight="bold"
            >
              {formatTimeRemaining(secondsRemaining)}
            </Text>
            <Text variant="caption" tone="muted" weight="semibold">
              {`${Object.keys(sessionState.selectedChoiceIds).length} answered`}
            </Text>
          </View>
        </View>

        <ProgressIndicator
          label={`Question ${sessionState.currentQuestionIndex + 1} of ${sessionState.questions.length}`}
          progress={progress}
        />

        <View style={styles.questionHeader}>
          <View style={styles.badge}>
            <Text variant="caption" weight="semibold">
              {formatSectionBadge(currentQuestion.sectionCode)}
            </Text>
          </View>
          <Text weight="semibold">{currentQuestion.text}</Text>
        </View>

        <View accessibilityRole="radiogroup" style={styles.choiceList}>
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;

            return (
              <Pressable
                key={choice.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => {
                  void handleSelectChoice(choice.id);
                }}
                style={[
                  styles.choiceItem,
                  {
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radius.md,
                    backgroundColor: isSelected
                      ? theme.colors.primaryMuted
                      : theme.colors.surface,
                  },
                ]}
              >
                <Text weight="medium">{choice.text}</Text>
                <Text
                  variant="caption"
                  tone={isSelected ? 'primary' : 'muted'}
                  weight="semibold"
                >
                  {isSelected ? 'Selected' : 'Tap to select'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isSavingAnswer ? <Text tone="muted">Saving answer...</Text> : null}

        <View style={styles.navigationRow}>
          <Button
            disabled={!hasPreviousQuestion}
            fullWidth={false}
            onPress={() =>
              setSessionState((current) =>
                current
                  ? {
                      ...current,
                      currentQuestionIndex: Math.max(0, current.currentQuestionIndex - 1),
                    }
                  : current,
              )
            }
            title="Previous"
            variant="ghost"
          />
          <Button
            fullWidth={false}
            onPress={() => {
              if (hasNextQuestion) {
                setSessionState((current) =>
                  current
                    ? {
                        ...current,
                        currentQuestionIndex: Math.min(
                          current.questions.length - 1,
                          current.currentQuestionIndex + 1,
                        ),
                      }
                    : current,
                );
                return;
              }

              void handleSubmitExam();
            }}
            title={hasNextQuestion ? 'Next' : 'Submit Exam'}
            loading={isSubmittingExam}
          />
        </View>
      </Card>
    );
  };

  const renderCompletion = (): React.JSX.Element | null => {
    if (!sessionState || !isExamComplete || !resultSummary) {
      return null;
    }

    return (
      <>
        <Card style={styles.sectionCard}>
          <Text variant="heading" weight="bold">
            Exam Complete
          </Text>
          <Text weight="semibold">{`${resultSummary.correctCount} / ${sessionState.questions.length} Correct`}</Text>
          <Text tone="primary" weight="semibold">
            {formatAccuracyPercentage(resultSummary.scorePercent)}
          </Text>
          <Text tone="muted">{`${sessionState.sectionName} Exam`}</Text>
          <Text tone="muted">{formatPracticeActivityTimestamp(resultSummary.completedAt)}</Text>
          <Button
            onPress={() =>
              navigation.navigate('ExamAttemptDetail', {
                attemptId: sessionState.attemptId,
              })
            }
            title="Review Results"
          />
          <Button onPress={handleRestart} title="Back to Exams" variant="ghost" />
        </Card>
      </>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Exams
        </Text>
        <Text tone="muted">
          Start a saved section exam or Universal exam and submit it when you are ready.
        </Text>
      </View>

      {!sessionState && !isExamComplete ? renderSetup() : null}
      {sessionState && !isExamComplete ? renderActiveExam() : null}
      {sessionState && isExamComplete ? renderCompletion() : null}

      {errorMessage ? (
        <Card style={styles.errorCard}>
          <Text tone="error" weight="semibold">
            {errorMessage}
          </Text>
          <Button fullWidth={false} onPress={() => void loadSections()} title="Retry" variant="ghost" />
        </Card>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  choiceItem: {
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  choiceList: {
    gap: 10,
  },
  errorCard: {
    gap: 12,
    marginTop: 20,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  metaGroup: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  navigationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionCard: {
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  optionList: {
    gap: 12,
  },
  questionHeader: {
    gap: 8,
  },
  sectionCard: {
    gap: 16,
    marginBottom: 20,
  },
  timerGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
});
