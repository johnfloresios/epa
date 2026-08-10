import React from 'react';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { buildFocusedStudyParams, useReadinessInsights } from '@/hooks/useReadinessInsights';
import { AppTabParamList, ProgressStackParamList } from '@/types/navigation';
import { formatAccuracyPercentage } from '@/utils/practiceProgress';
import { getReadinessStatusLabel } from '@/utils/readiness';
import { formatSectionBadge } from '@/utils/sections';

type Props = NativeStackScreenProps<ProgressStackParamList, 'Readiness'>;

export const ReadinessScreen = ({ navigation }: Props): React.JSX.Element => {
  const { readiness, isLoading, errorMessage, refresh } = useReadinessInsights();
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const focusedStudyParams = buildFocusedStudyParams(readiness.focusedStudyPlan);
  const hasEnoughData = readiness.overallStatus !== 'not_enough_data';

  const startFocusedStudy = (): void => {
    if (focusedStudyParams) {
      tabNavigation?.navigate('PracticeTab', {
        screen: 'PracticeHome',
        params: focusedStudyParams,
      });
      return;
    }

    tabNavigation?.navigate('PracticeTab', {
      screen: 'PracticeHome',
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Readiness
        </Text>
        <Text tone="muted">
          These are app study-readiness indicators based on your saved practice history.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading readiness...</Text>
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

      {!isLoading && !errorMessage ? (
        <>
          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Overall Readiness
            </Text>
            <Text weight="bold">{readiness.overallLabel}</Text>
            <Text tone="muted">{readiness.overallDescription}</Text>
            <Text tone="muted">{`Questions Answered: ${readiness.totalQuestionsAnswered}`}</Text>
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Section Readiness
            </Text>
            {readiness.sectionReadiness.length === 0 ? (
              <Text tone="muted">
                Not enough data yet. Complete more practice questions to estimate readiness.
              </Text>
            ) : (
              readiness.sectionReadiness.map((section) => (
                <View key={section.sectionId} style={styles.row}>
                  <View style={styles.labelBlock}>
                    <View style={styles.badge}>
                      <Text variant="caption" weight="semibold">
                        {formatSectionBadge(section.sectionCode)}
                      </Text>
                    </View>
                    <Text weight="semibold">{section.sectionName}</Text>
                    <Text tone="muted" variant="caption">
                      {`${formatAccuracyPercentage(section.accuracy)} • ${section.answeredCount} answered`}
                    </Text>
                  </View>
                  <Text weight="semibold">{getReadinessStatusLabel(section.status)}</Text>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Weakest Topics
            </Text>
            {readiness.weakestTopics.length === 0 ? (
              <Text tone="muted">Not enough topic history yet.</Text>
            ) : (
              readiness.weakestTopics.map((topic) => (
                <View key={`${topic.sectionId}-${topic.topicId ?? 'section'}`} style={styles.row}>
                  <View style={styles.labelBlock}>
                    <Text weight="semibold">{topic.topicName ?? topic.sectionName}</Text>
                    <Text tone="muted" variant="caption">
                      {`${topic.sectionName} • ${topic.answeredCount} answered`}
                    </Text>
                  </View>
                  <Text weight="semibold">{formatAccuracyPercentage(topic.accuracy)}</Text>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Recent Exam Performance
            </Text>
            <Text tone="muted">{readiness.recentExamPerformance.message}</Text>
          </Card>

          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Recommended Next Step
            </Text>
            <Text weight="semibold">{readiness.recommendation.title}</Text>
            <Text tone="muted">{readiness.recommendation.description}</Text>
            <Button
              fullWidth={false}
              onPress={startFocusedStudy}
              title={hasEnoughData ? 'Continue Focused Study' : 'Start Practice'}
            />
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
  labelBlock: {
    flex: 1,
    gap: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
