import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ProgressIndicator, ScreenContainer, Text } from '@/components';
import { contentService } from '@/services/supabase/content';
import { practiceService } from '@/services/supabase/practice';
import { useAuthStore } from '@/store/useAuthStore';
import {
  CertificationSection,
  QuestionChoiceWithAnswer,
  QuestionDetail,
  QuestionSummary,
  Topic,
} from '@/types/content';
import { PracticeStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/theme/ThemeContext';
import { translateContentError } from '@/utils/contentErrors';
import { translatePracticeError } from '@/utils/practiceErrors';
import { premiumConfig } from '@/config/premium';
import { usePremiumStore } from '@/store/usePremiumStore';
import { canAccessSectionBank } from '@/utils/premiumAccess';

type Props = NativeStackScreenProps<PracticeStackParamList, 'PracticeHome'>;

type SessionQuestion = QuestionDetail & {
  choices: QuestionChoiceWithAnswer[];
};

type SessionState = {
  id: string;
  sectionId: string;
  topicId: string | null;
  sessionLabel: string | null;
  questions: SessionQuestion[];
  currentQuestionIndex: number;
  selectedChoiceId: string | null;
  hasSubmitted: boolean;
  correctCount: number;
  answeredCount: number;
};

const PREMIUM_PRACTICE_QUESTION_COUNT = 20;

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

const prepareSessionQuestion = (question: QuestionDetail): SessionQuestion => ({
  ...question,
  choices: shuffleArray(question.choices),
});

export const PracticeScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const hasPremium = usePremiumStore((state) => state.hasPremium);
  const showPaywall = usePremiumStore((state) => state.showPaywall);
  const presetSectionId = route.params?.presetSectionId ?? null;
  const presetTopicId = route.params?.presetTopicId ?? null;
  const presetTitle = route.params?.presetTitle ?? null;
  const shouldAutoStart = route.params?.autoStart ?? false;
  const focusReason = route.params?.focusReason ?? null;
  const [sections, setSections] = useState<CertificationSection[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<QuestionSummary[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isFinishingSession, setIsFinishingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmittingAnswerRef = useRef(false);
  const isAdvancingQuestionRef = useRef(false);
  const hasAppliedPresetRef = useRef(false);
  const hasAutoStartedPresetRef = useRef(false);

  const selectedSection =
    sections.find((section) => section.id === selectedSectionId) ?? null;
  const canAccessSelectedSection = selectedSection
    ? canAccessSectionBank(selectedSection.code, hasPremium)
    : true;
  const practiceQuestionCount = selectedSection?.code === 'CORE'
    ? premiumConfig.freeCoreQuizQuestionCount
    : PREMIUM_PRACTICE_QUESTION_COUNT;
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null;

  const currentQuestion =
    sessionState?.questions[sessionState.currentQuestionIndex] ?? null;
  const selectedChoice =
    currentQuestion?.choices.find((choice) => choice.id === sessionState?.selectedChoiceId) ?? null;
  const hasNextQuestion = Boolean(
    sessionState &&
      sessionState.currentQuestionIndex < sessionState.questions.length - 1,
  );
  const isSelectedAnswerCorrect = Boolean(selectedChoice?.isCorrect);
  const progress =
    sessionState && sessionState.questions.length > 0
      ? (sessionState.currentQuestionIndex + 1) / sessionState.questions.length
      : 0;

  const currentSessionLabel =
    sessionState?.sessionLabel ??
    presetTitle ??
    selectedTopic?.name ??
    selectedSection?.name ??
    'Practice';
  const activeSessionQuestionCount = sessionState?.questions.length ?? 0;

  const loadSections = async (): Promise<void> => {
    try {
      setIsLoadingSections(true);
      setErrorMessage('');
      const sectionData = await contentService.getCertificationSections();
      setSections(sectionData);
      setSelectedSectionId((current) => current ?? sectionData[0]?.id ?? null);
    } catch (error) {
      setErrorMessage(translateContentError(error));
    } finally {
      setIsLoadingSections(false);
    }
  };

  const loadTopicsAndAvailableQuestions = async (
    sectionId: string,
    topicId: string | null,
  ): Promise<void> => {
    try {
      setIsLoadingTopics(true);
      setIsLoadingAvailable(true);
      setErrorMessage('');

      const [topicData, questionData] = await Promise.all([
        contentService.getTopicsBySection(sectionId),
        topicId
          ? contentService.getQuestionsByTopic(topicId)
          : contentService.getQuestionsBySection(sectionId),
      ]);

      setTopics(topicData);
      setAvailableQuestions(questionData);
      setSessionState(null);
      setIsSessionComplete(false);

      if (topicId && !topicData.some((topic) => topic.id === topicId)) {
        setSelectedTopicId(null);
      }

    } catch (error) {
      setErrorMessage(translateContentError(error));
      setTopics([]);
      setAvailableQuestions([]);
      setSessionState(null);
      setIsSessionComplete(false);
    } finally {
      setIsLoadingTopics(false);
      setIsLoadingAvailable(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  useEffect(() => {
    hasAppliedPresetRef.current = false;
    hasAutoStartedPresetRef.current = false;
  }, [
    presetSectionId,
    presetTitle,
    presetTopicId,
    shouldAutoStart,
  ]);

  useEffect(() => {
    if (hasAppliedPresetRef.current || sections.length === 0) {
      return;
    }

    if (presetSectionId) {
      setSelectedSectionId(presetSectionId);
    }

    if (presetTopicId !== undefined) {
      setSelectedTopicId(presetTopicId);
    }

    hasAppliedPresetRef.current = true;
  }, [presetSectionId, presetTopicId, sections.length]);

  useEffect(() => {
    if (!selectedSectionId) {
      setTopics([]);
      setAvailableQuestions([]);
      setSessionState(null);
      setIsSessionComplete(false);
      return;
    }

    void loadTopicsAndAvailableQuestions(selectedSectionId, selectedTopicId);
  }, [selectedSectionId, selectedTopicId]);

  useEffect(() => {
    const hasActiveSession = Boolean(sessionState) && !isSessionComplete;

    if (!hasActiveSession) {
      return undefined;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();

      Alert.alert('Leave Practice?', 'Your current practice session will be ended.', [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setSessionState(null);
            setIsSessionComplete(false);
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });

    return unsubscribe;
  }, [isSessionComplete, navigation, sessionState]);

  useEffect(() => {
    if (sessionState && !sessionState.hasSubmitted) {
      isAdvancingQuestionRef.current = false;
    }
  }, [sessionState?.currentQuestionIndex, sessionState?.hasSubmitted]);

  const startSession = async (
    options?: {
      overrideLabel?: string | null;
    },
  ): Promise<void> => {
    if (!selectedSectionId || !userId) {
      return;
    }

    if (!canAccessSelectedSection) {
      showPaywall();
      return;
    }

    if (availableQuestions.length < practiceQuestionCount) {
      return;
    }

    try {
      setIsLoadingSession(true);
      setErrorMessage('');

      const selectedQuestionIds = shuffleArray(availableQuestions)
        .slice(0, practiceQuestionCount)
        .map((question) => question.id);

      const details = await contentService.getQuestionDetailsByIds(selectedQuestionIds);

      if (details.length === 0) {
        setErrorMessage('No practice questions are available for this selection right now.');
        setSessionState(null);
        setIsSessionComplete(false);
        return;
      }

      const sessionRecord = await practiceService.createSession({
        userId,
        sectionId: selectedSectionId,
        topicId: selectedTopicId,
        questionCount: details.length,
      });

      setSessionState({
        id: sessionRecord.id,
        sectionId: selectedSectionId,
        topicId: selectedTopicId,
        sessionLabel: options?.overrideLabel ?? presetTitle ?? null,
        questions: details.map(prepareSessionQuestion),
        currentQuestionIndex: 0,
        selectedChoiceId: null,
        hasSubmitted: false,
        correctCount: 0,
        answeredCount: 0,
      });
      setIsSessionComplete(false);
    } catch (error) {
      setErrorMessage(translatePracticeError(error));
      setSessionState(null);
      setIsSessionComplete(false);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    if (
      hasAutoStartedPresetRef.current ||
      !shouldAutoStart ||
      sessionState ||
      isLoadingAvailable ||
      isLoadingSections ||
      isLoadingSession
    ) {
      return;
    }

    if (selectedSectionId && canAccessSelectedSection && availableQuestions.length >= practiceQuestionCount) {
      hasAutoStartedPresetRef.current = true;
      void startSession({
        overrideLabel: presetTitle,
      });
    }
  }, [
    availableQuestions.length,
    canAccessSelectedSection,
    isLoadingAvailable,
    isLoadingSections,
    isLoadingSession,
    presetTitle,
    practiceQuestionCount,
    selectedSectionId,
    sessionState,
    shouldAutoStart,
  ]);

  const handleCheckAnswer = async (): Promise<void> => {
    if (
      isSubmittingAnswerRef.current ||
      !sessionState?.selectedChoiceId ||
      !selectedChoice ||
      !currentQuestion ||
      !userId
    ) {
      return;
    }

    try {
      isSubmittingAnswerRef.current = true;
      setIsSubmittingAnswer(true);

      await practiceService.recordAnswer({
        sessionId: sessionState.id,
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
        selectedChoiceId: sessionState.selectedChoiceId,
        selectedChoiceText: selectedChoice.text,
        correctChoiceId: currentQuestion.choices.find((choice) => choice.isCorrect)?.id ?? null,
        correctChoiceText:
          currentQuestion.choices.find((choice) => choice.isCorrect)?.text ?? null,
        isCorrect: selectedChoice.isCorrect,
      });

      setSessionState((current) =>
        current
          ? {
              ...current,
              hasSubmitted: true,
              answeredCount: current.answeredCount + 1,
              correctCount: current.correctCount + (selectedChoice.isCorrect ? 1 : 0),
            }
          : current,
      );
    } catch (error) {
      Alert.alert('Unable to save your answer', translatePracticeError(error));
    } finally {
      isSubmittingAnswerRef.current = false;
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = async (): Promise<void> => {
    if (isAdvancingQuestionRef.current || !sessionState || !userId) {
      return;
    }

    if (sessionState.currentQuestionIndex >= sessionState.questions.length - 1) {
      try {
        isAdvancingQuestionRef.current = true;
        setIsFinishingSession(true);
        await practiceService.completeSession({
          sessionId: sessionState.id,
          userId,
          questionCount: sessionState.questions.length,
          correctCount: sessionState.correctCount,
        });
        setIsSessionComplete(true);
      } catch (error) {
        Alert.alert('Unable to finish practice', translatePracticeError(error));
      } finally {
        isAdvancingQuestionRef.current = false;
        setIsFinishingSession(false);
      }
      return;
    }

    isAdvancingQuestionRef.current = true;
    setSessionState((current) =>
      current
        ? {
            ...current,
            currentQuestionIndex: current.currentQuestionIndex + 1,
            selectedChoiceId: null,
            hasSubmitted: false,
          }
        : current,
    );
  };

  const handlePracticeAgain = async (): Promise<void> => {
    setSessionState(null);
    setIsSessionComplete(false);
    await startSession();
  };

  const handleBackToPractice = (): void => {
    setSessionState(null);
    setIsSessionComplete(false);
  };

  const handleRetry = (): void => {
    if (!selectedSectionId) {
      void loadSections();
      return;
    }

    void loadTopicsAndAvailableQuestions(selectedSectionId, selectedTopicId);
  };

  const renderEmptyState = (): React.JSX.Element => (
    <View style={styles.detailBlock}>
      <Text variant="subheading" weight="semibold">
        No questions available
      </Text>
      <Text tone="muted">
        There are no active practice questions for this selection yet. Try another topic or practice the full section.
      </Text>
      <Button fullWidth={false} onPress={handleRetry} title="Retry" variant="ghost" />
    </View>
  );

  const renderSetup = (): React.JSX.Element => (
    <>
      {!presetSectionId ? (
        <Card style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold">
            Choose a Section
          </Text>
          <Text tone="muted">
            Select the certification section you want to practice.
          </Text>
          {isLoadingSections ? (
            <Text tone="muted">Loading sections...</Text>
          ) : sections.length === 0 ? (
            <Text tone="muted">No certification sections are available yet.</Text>
          ) : (
            <View style={styles.optionList}>
              {sections.map((section) => {
                const isActive = section.id === selectedSectionId;
                const isLocked = !canAccessSectionBank(section.code, hasPremium);

                return (
                  <Pressable
                    key={section.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => {
                      if (isLocked) {
                        showPaywall();
                        return;
                      }
                      setSelectedSectionId(section.id);
                      setSelectedTopicId(null);
                    }}
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
                    <Text weight="semibold">{`${section.name}${isLocked ? ' • Premium' : ''}`}</Text>
                    {section.description ? (
                      <Text tone="muted">{section.description}</Text>
                    ) : null}
                    <Text
                      tone={isActive ? 'primary' : 'muted'}
                      variant="caption"
                      weight="semibold"
                    >
                      {isActive ? 'Selected Section' : 'Tap to select'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>
      ) : null}

      <Card style={styles.sectionCard}>
        <Text variant="subheading" weight="semibold">
          Choose a Topic
        </Text>
        <Text tone="muted">
          Topic selection is optional. You can practice the full section instead.
        </Text>
        {!canAccessSelectedSection ? (
          <View style={styles.detailBlock}>
            <Text tone="primary" weight="bold">PREMIUM REQUIRED</Text>
            <Text tone="muted">Unlock Premium to practice Type I, Type II, and Type III questions.</Text>
            <Button onPress={showPaywall} title="View Premium" />
          </View>
        ) : isLoadingTopics ? (
          <Text tone="muted">Loading topics...</Text>
        ) : (
          <View style={styles.optionList}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !selectedTopicId }}
              onPress={() => setSelectedTopicId(null)}
              style={[
                styles.optionCard,
                {
                  borderColor: !selectedTopicId ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.radius.lg,
                  backgroundColor: !selectedTopicId
                    ? theme.colors.primaryMuted
                    : theme.colors.surface,
                },
              ]}
            >
              <Text weight="semibold">Practice Entire Section</Text>
              <Text tone="muted">
                Load questions from all active topics in {selectedSection?.name ?? 'this section'}.
              </Text>
              <Text
                tone={!selectedTopicId ? 'primary' : 'muted'}
                variant="caption"
                weight="semibold"
              >
                {!selectedTopicId ? 'Selected Topic Scope' : 'Tap to use the full section'}
              </Text>
            </Pressable>

            {topics.length === 0 ? (
              <Text tone="muted">
                No topics are available yet for this section. The full section will still be used when questions exist.
              </Text>
            ) : (
              topics.map((topic) => {
                const isActive = topic.id === selectedTopicId;

                return (
                  <Pressable
                    key={topic.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => setSelectedTopicId(topic.id)}
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
                    <Text weight="semibold">{topic.name}</Text>
                    {topic.description ? (
                      <Text tone="muted">{topic.description}</Text>
                    ) : null}
                    <Text
                      tone={isActive ? 'primary' : 'muted'}
                      variant="caption"
                      weight="semibold"
                    >
                      {isActive ? 'Selected Topic' : 'Tap to practice only this topic'}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        )}
        {!canAccessSelectedSection ? null : isLoadingAvailable ? (
          <Text tone="muted">Loading questions...</Text>
        ) : availableQuestions.length < practiceQuestionCount ? (
          <View style={styles.detailBlock}>
            {availableQuestions.length === 0 ? renderEmptyState() : (
              <Text tone="muted">
                {`This selection needs at least ${practiceQuestionCount} questions before practice can begin.`}
              </Text>
            )}
          </View>
        ) : (
          <Button
            loading={isLoadingSession}
            onPress={() => {
              void startSession();
            }}
            title={`Start ${practiceQuestionCount}-Question Practice`}
          />
        )}
      </Card>
    </>
  );

  const renderActiveSession = (): React.JSX.Element | null => {
    if (!sessionState || !currentQuestion) {
      return null;
    }

    return (
      <Card style={styles.sectionCard}>
        <View style={styles.detailBlock}>
          <View style={styles.metaRow}>
            <View style={styles.metaGroup}>
              <Text variant="subheading" weight="semibold">
                {`${currentSessionLabel} Practice`}
              </Text>
              <Text tone="muted" variant="caption">
                {selectedTopic
                  ? `${selectedSection?.name ?? 'Practice'} topic focus`
                  : 'Entire section practice set'}
              </Text>
            </View>
            <Text variant="caption" tone="muted" weight="semibold">
              {`${sessionState.answeredCount} answered`}
            </Text>
          </View>

          <ProgressIndicator
            label={`Question ${sessionState.currentQuestionIndex + 1} of ${activeSessionQuestionCount}`}
            progress={progress}
          />

          <View style={styles.questionHeader}>
            <Text variant="caption" tone="muted" weight="semibold">
              {`Question ${sessionState.currentQuestionIndex + 1}`}
            </Text>
            <Text weight="semibold">{currentQuestion.text}</Text>
          </View>

          <View accessibilityRole="radiogroup" style={styles.choiceList}>
            {currentQuestion.choices.map((choice, index) => {
              const isSelected = choice.id === sessionState.selectedChoiceId;
              const showCorrect = sessionState.hasSubmitted && choice.isCorrect;
              const showIncorrect =
                sessionState.hasSubmitted && isSelected && !choice.isCorrect;
              const statusLabel = showCorrect
                ? 'Correct answer'
                : showIncorrect
                  ? 'Incorrect answer'
                  : isSelected
                    ? 'Selected'
                    : 'Not selected';

              return (
                <Pressable
                  key={choice.id}
                  accessibilityRole="radio"
                  accessibilityLabel={`Choice ${index + 1}. ${choice.text}. ${statusLabel}.`}
                  accessibilityState={{
                    checked: isSelected,
                    disabled: sessionState.hasSubmitted,
                  }}
                  disabled={sessionState.hasSubmitted}
                  onPress={() =>
                    setSessionState((current) =>
                      current
                        ? {
                            ...current,
                            selectedChoiceId: choice.id,
                          }
                        : current,
                    )
                  }
                  style={[
                    styles.choiceItem,
                    {
                      borderColor: showCorrect
                        ? theme.colors.success
                        : showIncorrect
                          ? theme.colors.error
                          : isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                      borderRadius: theme.radius.md,
                      backgroundColor: showCorrect
                        ? theme.colors.primaryMuted
                        : showIncorrect
                          ? theme.colors.surfaceAlt
                          : isSelected
                            ? theme.colors.primaryMuted
                            : theme.colors.surface,
                    },
                  ]}
                >
                  <View style={styles.choiceHeader}>
                    <Text weight="medium">{choice.text}</Text>
                    <Text
                      variant="caption"
                      tone={
                        showCorrect
                          ? 'success'
                          : showIncorrect
                            ? 'error'
                            : isSelected
                              ? 'primary'
                              : 'muted'
                      }
                      weight="semibold"
                    >
                      {showCorrect
                        ? 'Correct Answer'
                        : showIncorrect
                          ? 'Your Answer'
                          : isSelected
                            ? 'Selected'
                            : ' '}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {!sessionState.hasSubmitted ? (
            <Button
              disabled={!sessionState.selectedChoiceId}
              loading={isSubmittingAnswer}
              onPress={() => {
                void handleCheckAnswer();
              }}
              title="Check Answer"
            />
          ) : (
            <View style={styles.detailBlock}>
              <Card
                style={[
                  styles.feedbackCard,
                  {
                    backgroundColor: isSelectedAnswerCorrect
                      ? theme.colors.primaryMuted
                      : theme.colors.surfaceAlt,
                  },
                ]}
              >
                <Text
                  tone={isSelectedAnswerCorrect ? 'success' : 'error'}
                  weight="semibold"
                >
                  {isSelectedAnswerCorrect ? 'Correct' : 'Incorrect'}
                </Text>
                <Text tone="muted">
                  {isSelectedAnswerCorrect
                    ? 'You selected the right answer.'
                    : 'Review the correct answer and explanation before continuing.'}
                </Text>
              </Card>

              {currentQuestion.explanation ? (
                <View style={styles.explanation}>
                  <Text variant="caption" tone="muted" weight="semibold">
                    Explanation
                  </Text>
                  <Text tone="muted">{currentQuestion.explanation}</Text>
                </View>
              ) : null}

              <Button
                loading={isFinishingSession}
                onPress={() => {
                  void handleNextQuestion();
                }}
                title={hasNextQuestion ? 'Next Question' : 'Finish Practice'}
                variant="secondary"
              />
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderCompletion = (): React.JSX.Element | null => {
    if (!sessionState || !isSessionComplete) {
      return null;
    }

    const incorrectCount = sessionState.answeredCount - sessionState.correctCount;
    const percentage =
      sessionState.answeredCount > 0
        ? Math.round((sessionState.correctCount / sessionState.answeredCount) * 100)
        : 0;

    return (
      <Card style={styles.sectionCard}>
        <Text variant="subheading" weight="bold">
          Practice Complete
        </Text>
        <Text weight="semibold">{`${sessionState.correctCount} / ${sessionState.answeredCount} Correct`}</Text>
        <Text tone="primary" weight="semibold">{`${percentage}%`}</Text>
        <Text tone="muted">{currentSessionLabel}</Text>
        <View style={styles.statsRow}>
          <Text>{`Correct: ${sessionState.correctCount}`}</Text>
          <Text>{`Incorrect: ${incorrectCount}`}</Text>
        </View>
        <Button
          loading={isLoadingSession}
          onPress={() => {
            void handlePracticeAgain();
          }}
          title="Practice Again"
        />
        <Button onPress={handleBackToPractice} title="Back to Practice" variant="ghost" />
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Practice
        </Text>
        <Text tone="muted">
          Core includes a free randomized 25-question quiz. Premium unlocks the Type I, II, and III banks.
        </Text>
      </View>

      {focusReason ? (
        <Card style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold">
            Focused Study
          </Text>
          <Text tone="muted">{focusReason}</Text>
        </Card>
      ) : null}

      {!sessionState && !isSessionComplete ? renderSetup() : null}
      {sessionState && !isSessionComplete ? renderActiveSession() : null}
      {sessionState && isSessionComplete ? renderCompletion() : null}

      {errorMessage ? (
        <Card style={styles.errorCard}>
          <Text tone="error" weight="semibold">
            {errorMessage}
          </Text>
          <Button fullWidth={false} onPress={handleRetry} title="Retry" variant="ghost" />
        </Card>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  choiceHeader: {
    gap: 8,
  },
  choiceItem: {
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  choiceList: {
    gap: 10,
  },
  detailBlock: {
    gap: 14,
  },
  errorCard: {
    gap: 12,
    marginTop: 20,
  },
  explanation: {
    gap: 6,
  },
  feedbackCard: {
    gap: 8,
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
  statsRow: {
    gap: 8,
  },
});
