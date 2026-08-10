import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { useReviewInsights } from '@/hooks/useReviewInsights';
import { AppTabParamList, ProgressStackParamList } from '@/types/navigation';
import { formatAccuracyPercentage } from '@/utils/practiceProgress';
import { getWeakAreaStatusLabel } from '@/utils/review';
import { formatSectionBadge } from '@/utils/sections';

type Props = NativeStackScreenProps<ProgressStackParamList, 'WeakAreas'>;

export const WeakAreasScreen = ({ navigation }: Props): React.JSX.Element => {
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const { insights, isLoading, errorMessage, refresh } = useReviewInsights();
  const actionableWeakAreas = insights.weakAreas.filter(
    (item) => item.status === 'needs_attention' || item.status === 'developing',
  );
  const measuredAreas = insights.weakAreas.filter(
    (item) => item.status !== 'not_enough_data',
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Weak Areas
        </Text>
        <Text tone="muted">
          Use your saved answer history to focus on the sections and topics that need work.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading weak areas...</Text>
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

      {!isLoading && !errorMessage && measuredAreas.length === 0 ? (
        <Card style={styles.card}>
          <Text variant="subheading" weight="semibold">
            Not enough data yet
          </Text>
          <Text tone="muted">
            Complete more practice questions to identify your weak areas.
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

      {!isLoading && !errorMessage && measuredAreas.length > 0 ? (
        <>
          <Card style={styles.card}>
            <Text variant="subheading" weight="semibold">
              Needs Attention
            </Text>
            {actionableWeakAreas.length === 0 ? (
              <Text tone="muted">
                You are currently strong across the areas with enough history to evaluate.
              </Text>
            ) : (
              actionableWeakAreas.map((area) => (
                <Card key={area.key} elevated={false} style={styles.innerCard}>
                  <View style={styles.badge}>
                    <Text variant="caption" weight="semibold">
                      {formatSectionBadge(area.sectionCode)}
                    </Text>
                  </View>
                  <Text weight="semibold">
                    {area.topicName ?? area.sectionName}
                  </Text>
                  <Text tone="muted">
                    {area.topicName ? area.sectionName : 'Section performance'}
                  </Text>
                  <Text weight="semibold">{formatAccuracyPercentage(area.accuracy)}</Text>
                  <Text tone="muted">
                    {`${area.correctCount} / ${area.answeredCount} correct`}
                  </Text>
                  <Text tone="muted" variant="caption">
                    {getWeakAreaStatusLabel(area.status)}
                  </Text>
                  <Button
                    fullWidth={false}
                    onPress={() =>
                      tabNavigation?.navigate('PracticeTab', {
                        screen: 'PracticeHome',
                        params: {
                          presetSectionId: area.sectionId,
                          presetTopicId: area.topicId,
                          presetTitle: area.topicName ?? area.sectionName,
                          presetCount: 'all',
                          autoStart: true,
                        },
                      })
                    }
                    title={area.topicId ? 'Practice This Topic' : 'Practice This Section'}
                  />
                </Card>
              ))
            )}
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
  innerCard: {
    gap: 10,
  },
});
