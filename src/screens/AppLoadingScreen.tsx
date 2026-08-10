import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenContainer, Text } from '@/components';
import { useAppTheme } from '@/theme/ThemeContext';

export const AppLoadingScreen = (): React.JSX.Element => {
  const theme = useAppTheme();

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.content}>
        <Text variant="subheading" tone="primary" weight="semibold">
          EPA 608 PRO
        </Text>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text tone="muted">Loading...</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
});
