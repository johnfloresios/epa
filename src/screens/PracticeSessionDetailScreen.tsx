import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { usePracticeSessionHistory } from '@/hooks/usePracticeSessionHistory';
import { useAppTheme } from '@/theme/ThemeContext';
import { ActivityStackParamList } from '@/types/navigation';
import {
  formatAccuracyPercentage,
  formatPracticeActivityTimestamp,
} from '@/utils/practiceProgress';
import { formatSectionBadge, formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<ActivityStackParamList, 'PracticeSessionDetail'>;

export const PracticeSessionDetailScreen = ({
  navigation,
  route,
}: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const { sessionDetail, isLoading, errorMessage, refresh } = usePracticeSessionHistory({
    sessionId: route.params.sessionId,
  });

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Practice History
        </Text>
        <Text tone="muted">
          Review your saved question results for this practice session.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading session history...</Text>
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

      {!isLoading && !errorMessage && !sessionDetail ? (
        <Card style={styles.card}>
          <Text tone="muted">This practice session could not be found.</Text>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && sessionDetail ? (
        <>
          <Card style={styles.card}>
            <View
              style={[
                styles.badge,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.surfaceAlt,
                },
              ]}
            >
              <Text variant="caption" weight="semibold">
                {formatSectionBadge(sessionDetail.sectionCode)}
              </Text>
            </View>
            <Text variant="subheading" weight="semibold">
              {`${formatSectionName(sessionDetail.sectionCode)} Practice`}
            </Text>
            <Text tone="muted">
              {sessionDetail.topicName ?? 'Entire section practice'}
            </Text>
            <View style={styles.statsRow}>
              <Text weight="semibold">{`Score: ${sessionDetail.correctCount} / ${sessionDetail.questionCount}`}</Text>
              <Text weight="semibold">
                {`Accuracy: ${formatAccuracyPercentage(sessionDetail.accuracy)}`}
              </Text>
            </View>
            <Text tone="muted">
              {sessionDetail.completedAt
                ? formatPracticeActivityTimestamp(sessionDetail.completedAt)
                : 'In progress'}
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Question History
            </Text>
            {sessionDetail.questionHistory.map((answer) => (
              <Pressable
                key={answer.id}
                onPress={() =>
                  navigation.navigate('PracticeQuestionDetail', {
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
                <View
                  style={[
                    styles.badge,
                    {
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.pill,
                      backgroundColor: theme.colors.surfaceAlt,
                    },
                  ]}
                >
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
