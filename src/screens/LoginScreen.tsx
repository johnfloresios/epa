import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Input, ScreenContainer, Text } from '@/components';
import { useAppTheme } from '@/theme/ThemeContext';

export const LoginScreen = (): React.JSX.Element => {
  const theme = useAppTheme();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Login
        </Text>
        <Text tone="muted">
          Authentication is intentionally deferred to a later phase.
        </Text>
      </View>
      <Card>
        <View style={styles.form}>
          <Input editable={false} label="Email" placeholder="you@example.com" />
          <Input editable={false} label="Password" placeholder="••••••••" secureTextEntry />
          <Button disabled title="Coming Soon" />
        </View>
      </Card>
      <View
        style={[
          styles.note,
          {
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        <Text tone="primary">
          This placeholder exists to validate unauthenticated navigation only.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  note: {
    marginTop: 20,
    padding: 16,
  },
});
