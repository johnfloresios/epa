import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { usePracticeSessionHistory } from '@/hooks/usePracticeSessionHistory';
import { useAppTheme } from '@/theme/ThemeContext';
import { ActivityStackParamList } from '@/types/navigation';
import { formatSectionBadge, formatSectionName } from '@/utils/sections';

type Props = NativeStackScreenProps<ActivityStackParamList, 'PracticeQuestionDetail'>;

export const PracticeQuestionDetailScreen = ({ route }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const { answerDetail, isLoading, errorMessage, refresh } = usePracticeSessionHistory({
    answerId: route.params.answerId,
  });

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Question History
        </Text>
        <Text tone="muted">
          Review the saved result for this question.
        </Text>
      </View>

      {isLoading ? (
        <Card style={styles.card}>
          <Text tone="muted">Loading question history...</Text>
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

      {!isLoading && !errorMessage && !answerDetail ? (
        <Card style={styles.card}>
          <Text tone="muted">This question history could not be found.</Text>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && answerDetail ? (
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
              {formatSectionBadge(answerDetail.sectionCode)}
            </Text>
          </View>
          <Text variant="subheading" weight="semibold">
            {formatSectionName(answerDetail.sectionCode)}
          </Text>
          {answerDetail.topicName ? (
            <Text tone="muted">{answerDetail.topicName}</Text>
          ) : null}
          {answerDetail.questionText ? (
            <Text weight="semibold">{answerDetail.questionText}</Text>
          ) : null}
          <Text
            tone={answerDetail.isCorrect ? 'success' : 'error'}
            weight="semibold"
          >
            {answerDetail.isCorrect ? 'Correct' : 'Incorrect'}
          </Text>
          <View style={styles.detailBlock}>
            <Text variant="caption" tone="muted" weight="semibold">
              Your Answer
            </Text>
            <Text>{answerDetail.selectedChoiceText ?? 'Not available'}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text variant="caption" tone="muted" weight="semibold">
              Correct Answer
            </Text>
            <Text>{answerDetail.correctChoiceText ?? 'Not available'}</Text>
          </View>
          {answerDetail.explanation ? (
            <View style={styles.detailBlock}>
              <Text variant="caption" tone="muted" weight="semibold">
                Explanation
              </Text>
              <Text tone="muted">{answerDetail.explanation}</Text>
            </View>
          ) : null}
          <Text tone="muted" variant="caption">
            {`Question version ${answerDetail.questionVersion}`}
          </Text>
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
});
