import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { useMissedQuestionDetail } from '@/hooks/useReviewInsights';
import { ProgressStackParamList } from '@/types/navigation';
import { formatPracticeActivityTimestamp } from '@/utils/practiceProgress';
import { formatSectionBadge, formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<ProgressStackParamList, 'MissedQuestionDetail'>;

export const MissedQuestionDetailScreen = ({ route }: Props): React.JSX.Element => {
  const { detail, isLoading, errorMessage, refresh } = useMissedQuestionDetail(
    route.params.questionId,
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Missed Question Review
        </Text>
        <Text tone="muted">
          Review your most recent answer, the correct answer, and your attempt history.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading question review...</Text>
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

      {!isLoading && !errorMessage && !detail ? (
        <Card style={styles.card}>
          <Text tone="muted">This missed-question record could not be found.</Text>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && detail ? (
        <>
          <Card style={styles.card}>
            <View style={styles.badge}>
              <Text variant="caption" weight="semibold">
                {formatSectionBadge(detail.sectionCode)}
              </Text>
            </View>
            <Text variant="subheading" weight="semibold">
              {formatSectionName(detail.sectionCode)}
            </Text>
            {detail.topicName ? <Text tone="muted">{detail.topicName}</Text> : null}
            <Text weight="semibold">
              {detail.questionText ?? 'Question text unavailable'}
            </Text>
            <View style={styles.detailBlock}>
              <Text variant="caption" tone="muted" weight="semibold">
                Your Most Recent Answer
              </Text>
              <Text>{detail.mostRecentAnswer ?? 'Not available'}</Text>
            </View>
            <View style={styles.detailBlock}>
              <Text variant="caption" tone="muted" weight="semibold">
                Correct Answer
              </Text>
              <Text>{detail.correctAnswer ?? 'Not available'}</Text>
            </View>
            {detail.explanation ? (
              <View style={styles.detailBlock}>
                <Text variant="caption" tone="muted" weight="semibold">
                  Explanation
                </Text>
                <Text tone="muted">{detail.explanation}</Text>
              </View>
            ) : null}
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Attempt History
            </Text>
            {detail.attemptHistory.map((attempt, index) => (
              <View key={attempt.answerId} style={styles.historyRow}>
                <Text weight="semibold">{`Attempt ${detail.attemptHistory.length - index}`}</Text>
                <Text tone={attempt.isCorrect ? 'success' : 'error'} weight="semibold">
                  {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                </Text>
                <Text tone="muted">{attempt.selectedChoiceText ?? 'No answer recorded'}</Text>
                <Text tone="muted" variant="caption">
                  {formatPracticeActivityTimestamp(attempt.answeredAt)}
                </Text>
              </View>
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
  detailBlock: {
    gap: 6,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  historyRow: {
    gap: 6,
  },
});
