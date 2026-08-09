import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { AppNavigator } from '@/navigation/AppNavigator';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { useAppStore } from '@/store/useAppStore';
import { useAppTheme } from '@/theme/ThemeContext';

type Props = {
  onContinue: () => void;
};

export const RootNavigation = ({ onContinue }: Props): React.JSX.Element => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasSeenWelcome = useAppStore((state) => state.hasSeenWelcome);
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
      {isAuthenticated || hasSeenWelcome ? <AppNavigator /> : <AuthNavigator onContinue={onContinue} />}
    </NavigationContainer>
  );
};
