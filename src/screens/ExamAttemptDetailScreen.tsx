import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { useExamHistory } from '@/hooks/useExamHistory';
import { ExamHistoryRouteParamList } from '@/types/navigation';
import {
  formatAccuracyPercentage,
  formatPracticeActivityTimestamp,
} from '@/utils/practiceProgress';
import { formatSectionBadge, formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<ExamHistoryRouteParamList, 'ExamAttemptDetail'>;

export const ExamAttemptDetailScreen = ({
  navigation,
  route,
}: Props): React.JSX.Element => {
  const { attemptDetail, isLoading, errorMessage, refresh } = useExamHistory({
    attemptId: route.params.attemptId,
  });

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Exam Results
        </Text>
        <Text tone="muted">
          Review your saved score and question history for this exam attempt.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading exam results...</Text>
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

      {!isLoading && !errorMessage && !attemptDetail ? (
        <Card style={styles.card}>
          <Text tone="muted">This exam attempt could not be found.</Text>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && attemptDetail ? (
        <>
          <Card style={styles.card}>
            <View style={styles.badge}>
              <Text variant="caption" weight="semibold">
                {formatSectionBadge(attemptDetail.sectionCode)}
              </Text>
            </View>
            <Text variant="subheading" weight="semibold">
              {`${formatSectionName(attemptDetail.sectionCode)} Exam`}
            </Text>
            <View style={styles.statsRow}>
              <Text weight="semibold">{`Score: ${attemptDetail.correctCount} / ${attemptDetail.questionCount}`}</Text>
              <Text weight="semibold">
                {`Accuracy: ${formatAccuracyPercentage(attemptDetail.accuracy)}`}
              </Text>
            </View>
            <Text tone="muted">
              {attemptDetail.completedAt
                ? formatPracticeActivityTimestamp(attemptDetail.completedAt)
                : 'In progress'}
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Question History
            </Text>
            {attemptDetail.questionHistory.map((answer) => (
              <Pressable
                key={answer.id}
                onPress={() =>
                  navigation.navigate('ExamQuestionDetail', {
                    answerId: answer.id,
                  })
                }
                style={styles.historyRow}
              >
                <View style={styles.historyLabel}>
                  <Text weight="semibold">{`${answer.questionOrder}. ${answer.isCorrect ? 'Correct' : 'Incorrect'}`}</Text>
                  <Text tone="muted" variant="caption">
                    {answer.topicName ?? answer.sectionName}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text variant="caption" weight="semibold">
                    {formatSectionBadge(answer.sectionCode)}
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
  header: {
    gap: 8,
    marginBottom: 24,
  },
  historyLabel: {
    flex: 1,
    gap: 4,
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statsRow: {
    gap: 8,
  },
});
