import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, ProgressIndicator, ScreenContainer, Text } from '@/components';
import { useAppTheme } from '@/theme/ThemeContext';
import { AppStackParamList } from '@/types/navigation';

const sections = [
  { title: 'Practice', subtitle: 'Targeted question drills by topic', route: 'Practice' },
  { title: 'Exams', subtitle: 'Timed mock exams coming in a later phase', route: 'Exams' },
  { title: 'Progress', subtitle: 'Track readiness and session history', route: 'Progress' },
  { title: 'Profile', subtitle: 'Manage account settings and preferences', route: 'Profile' },
] as const;

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

export const DashboardScreen = ({ navigation }: Props): React.JSX.Element => {
  const theme = useAppTheme();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Dashboard
        </Text>
        <Text tone="muted">
          Phase 1 exposes the app shell and reusable surfaces, not the learning data yet.
        </Text>
        <Button
          fullWidth={false}
          onPress={() => navigation.navigate('Profile')}
          title="View Profile"
          variant="ghost"
        />
      </View>

      <Card style={styles.card}>
        <Text variant="subheading" weight="semibold">
          Readiness
        </Text>
        <ProgressIndicator label="Foundation Completion" progress={0.2} />
      </Card>

      <View style={styles.grid}>
        {sections.map((section) => (
          <Pressable key={section.title} onPress={() => navigation.navigate(section.route)}>
            <Card style={[styles.tile, { borderColor: theme.colors.border }]}>
              <Text weight="semibold">{section.title}</Text>
              <Text tone="muted">{section.subtitle}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 16,
    marginBottom: 20,
  },
  grid: {
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  tile: {
    gap: 10,
  },
});
