import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { usePracticeProgress } from '@/hooks/usePracticeProgress';
import { useAppTheme } from '@/theme/ThemeContext';
import { AppTabParamList, ProgressStackParamList } from '@/types/navigation';
import {
  formatAccuracyPercentage,
  formatPracticeActivityTimestamp,
} from '@/utils/practiceProgress';

type Props = NativeStackScreenProps<ProgressStackParamList, 'ProgressHome'>;

export const ProgressScreen = ({ navigation }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const { summary, isLoading, errorMessage, refresh } = usePracticeProgress();
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const hasHistory =
    summary.practiceSessions > 0 ||
    summary.examAttempts > 0 ||
    summary.questionsAnswered > 0 ||
    summary.recentSessions.length > 0;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Progress
        </Text>
        <Text tone="muted">
          See how much you have completed and where to focus next.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading progress...</Text>
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

      {!isLoading && !errorMessage && !hasHistory ? (
        <Card style={styles.card}>
          <Text variant="subheading" weight="semibold">
            No study history yet.
          </Text>
          <Text tone="muted">
            Complete a practice session or exam to start tracking your progress.
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

      {!isLoading && !errorMessage && hasHistory ? (
        <>
          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              At a Glance
            </Text>
            <View style={styles.primaryMetric}>
              <Text style={styles.primaryMetricValue} weight="bold">
                {formatAccuracyPercentage(summary.overallAccuracy)}
              </Text>
              <Text tone="muted">Overall accuracy</Text>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text tone="muted" variant="caption" weight="semibold">
                  CORRECT
                </Text>
                <Text variant="subheading" weight="bold">{String(summary.correctAnswers)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text tone="muted" variant="caption" weight="semibold">
                  ANSWERED
                </Text>
                <Text variant="subheading" weight="bold">{String(summary.questionsAnswered)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text tone="muted" variant="caption" weight="semibold">
                  ACTIVITIES
                </Text>
                <Text variant="subheading" weight="bold">
                  {String(summary.practiceSessions + summary.examAttempts)}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Section Performance
            </Text>
            {summary.sectionPerformance.length === 0 ? (
              <Text tone="muted">
                Complete section practice to populate section performance.
              </Text>
            ) : (
              summary.sectionPerformance.map((item) => (
                <View
                  accessibilityLabel={`${item.label}: ${formatAccuracyPercentage(item.accuracy)}, ${item.correctCount} of ${item.answeredCount} correct`}
                  key={item.id}
                  style={styles.performanceItem}
                >
                  <View style={styles.listRow}>
                    <Text weight="semibold">{item.label}</Text>
                    <Text weight="bold">{formatAccuracyPercentage(item.accuracy)}</Text>
                  </View>
                  <View
                    style={[
                      styles.barTrack,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderRadius: theme.radius.pill,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: item.accuracy >= 0.8
                            ? theme.colors.success
                            : theme.colors.primary,
                          borderRadius: theme.radius.pill,
                          width: `${Math.max(2, Math.round(item.accuracy * 100))}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text tone="muted" variant="caption">
                    {`${item.correctCount} of ${item.answeredCount} correct`}
                  </Text>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Recent Results
            </Text>
            {summary.recentSessions.length === 0 ? (
              <Text tone="muted">
                Complete a full practice session to populate recent history.
              </Text>
            ) : (
              summary.recentSessions.slice(0, 5).map((session) => (
                <Pressable
                  key={session.id}
                  onPress={() =>
                    session.type === 'practice'
                      ? navigation.navigate('PracticeSessionDetail', {
                          sessionId: session.id,
                        })
                      : navigation.navigate('ExamAttemptDetail', {
                          attemptId: session.id,
                        })
                  }
                  style={styles.historyItem}
                >
                  <View style={styles.listRow}>
                    <View style={styles.listLabel}>
                      <Text weight="semibold">{session.label}</Text>
                      <Text tone="muted" variant="caption">
                        {`${session.sectionName} • ${session.type === 'practice' ? 'Practice' : 'Exam'}`}
                      </Text>
                    </View>
                    <Text weight="semibold">{formatAccuracyPercentage(session.accuracy)}</Text>
                  </View>
                  <View style={styles.listRow}>
                    <Text tone="muted">{`${session.correctCount} / ${session.questionCount}`}</Text>
                    <Text tone="muted">{formatPracticeActivityTimestamp(session.completedAt)}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </Card>
        </>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  barFill: {
    height: 10,
  },
  barTrack: {
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  card: {
    gap: 16,
    marginBottom: 20,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  historyItem: {
    gap: 8,
  },
  listLabel: {
    flex: 1,
    gap: 4,
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    gap: 4,
  },
  performanceItem: {
    gap: 8,
  },
  primaryMetric: {
    gap: 2,
  },
  primaryMetricValue: {
    fontSize: 42,
    lineHeight: 48,
  },
});
