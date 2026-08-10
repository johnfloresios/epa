import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { studyConfig } from '@/config/study';
import { useReviewInsights } from '@/hooks/useReviewInsights';
import { AppTabParamList, ProgressStackParamList } from '@/types/navigation';
import { formatPracticeActivityTimestamp } from '@/utils/practiceProgress';
import { formatSectionBadge, formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<ProgressStackParamList, 'MissedQuestions'>;

export const MissedQuestionsScreen = ({ navigation }: Props): React.JSX.Element => {
  const { insights, isLoading, errorMessage, refresh } = useReviewInsights();
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');

  const sectionOptions = useMemo(() => {
    const seen = new Map<
      string,
      { id: string; code: (typeof insights.missedQuestions)[number]['sectionCode']; name: string }
    >();

    insights.missedQuestions.forEach((question) => {
      if (!seen.has(question.sectionId)) {
        seen.set(question.sectionId, {
          id: question.sectionId,
          code: question.sectionCode,
          name: question.sectionName,
        });
      }
    });

    return Array.from(seen.values());
  }, [insights.missedQuestions]);

  const filteredQuestions =
    selectedSectionId === 'all'
      ? insights.missedQuestions
      : insights.missedQuestions.filter((question) => question.sectionId === selectedSectionId);

  const canPracticeFilteredQuestions =
    filteredQuestions.length > 0 &&
    (selectedSectionId !== 'all' || sectionOptions.length <= 1);

  const practiceSectionId =
    selectedSectionId === 'all' ? sectionOptions[0]?.id ?? null : selectedSectionId;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Missed Questions
        </Text>
        <Text tone="muted">
          Review the questions you have missed and retry them through the normal practice flow.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading missed questions...</Text>
        </Card>
      ) : null}

      {!isLoading && errorMessage ? (
        <Card style={styles.card}>
          <Text tone="error" weight="semibold">
            {errorMessage}
          </Text>
          <Button fullWidth={false} onPress={() => void refresh()} title="Retry" variant="ghost" />
        </Card>
      ) : null}

      {!isLoading && !errorMessage && insights.missedQuestions.length === 0 ? (
        <Card style={styles.card}>
          <Text variant="subheading" weight="semibold">
            No missed questions to review.
          </Text>
          <Text tone="muted">
            Keep practicing to build more review data.
          </Text>
          <Button
            fullWidth={false}
            onPress={() =>
              tabNavigation?.navigate('PracticeTab', {
                screen: 'PracticeHome',
              })
            }
            title="Start Practicing"
          />
        </Card>
      ) : null}

      {!isLoading && !errorMessage && insights.missedQuestions.length > 0 ? (
        <>
          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Practice Missed Questions
            </Text>
            <View style={styles.filterRow}>
              <Pressable
                onPress={() => setSelectedSectionId('all')}
                style={styles.filterChip}
              >
                <Text variant="caption" weight="semibold">
                  All
                </Text>
              </Pressable>
              {sectionOptions.map((section) => (
                <Pressable
                  key={section.id}
                  onPress={() => setSelectedSectionId(section.id)}
                  style={styles.filterChip}
                >
                  <Text variant="caption" weight="semibold">
                    {formatSectionBadge(section.code)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {canPracticeFilteredQuestions && practiceSectionId ? (
              <Button
                fullWidth={false}
                onPress={() =>
                  tabNavigation?.navigate('PracticeTab', {
                    screen: 'PracticeHome',
                    params: {
                      presetSectionId: practiceSectionId,
                      presetQuestionIds: filteredQuestions
                        .slice(0, studyConfig.missedQuestionsPracticeLimit)
                        .map((question) => question.questionId),
                      presetTitle: 'Missed Questions',
                      presetCount: 'all',
                      autoStart: true,
                    },
                  })
                }
                title="Practice Missed Questions"
              />
            ) : (
              <Text tone="muted">
                Select a single section to retry missed questions in practice.
              </Text>
            )}
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Review List
            </Text>
            {filteredQuestions.map((question) => (
              <Pressable
                key={question.questionId}
                onPress={() =>
                  navigation.navigate('MissedQuestionDetail', {
                    questionId: question.questionId,
                  })
                }
                style={styles.questionRow}
              >
                <View style={styles.questionLabel}>
                  <View style={styles.badge}>
                    <Text variant="caption" weight="semibold">
                      {formatSectionBadge(question.sectionCode)}
                    </Text>
                  </View>
                  <Text weight="semibold" numberOfLines={2}>
                    {question.questionText ?? 'Question text unavailable'}
                  </Text>
                  <Text tone="muted" variant="caption">
                    {question.topicName ?? formatSectionName(question.sectionCode)}
                  </Text>
                  <Text tone="muted" variant="caption">
                    {`Attempted ${question.attemptsCount} times • Missed ${question.incorrectCount} times`}
                  </Text>
                  <Text tone="muted" variant="caption">
                    {`Last attempted ${formatPracticeActivityTimestamp(question.lastAttempted)}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </>
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
  card: {
    gap: 16,
    marginBottom: 20,
  },
  filterChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  questionLabel: {
    gap: 6,
  },
  questionRow: {
    gap: 8,
  },
});
