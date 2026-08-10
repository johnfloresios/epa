import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { AppNavigator } from '@/navigation/AppNavigator';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { AppLoadingScreen } from '@/screens/AppLoadingScreen';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';

type Props = {
  onContinue: () => void;
};

export const RootNavigation = ({ onContinue }: Props): React.JSX.Element => {
  const hasSeenWelcome = useAppStore((state) => state.hasSeenWelcome);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const theme = useAppTheme();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      border: theme.colors.border,
      primary: theme.colors.primary,
      text: theme.colors.text,
      notification: theme.colors.secondary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isInitializing ? (
        <AppLoadingScreen />
      ) : isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator hasSeenWelcome={hasSeenWelcome} onContinue={onContinue} />
      )}
    </NavigationContainer>
  );
};
