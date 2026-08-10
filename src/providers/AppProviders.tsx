import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/theme/ThemeContext';
import { useTheme } from '@/theme/useTheme';
import { useAppStore } from '@/store/useAppStore';

type Props = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: Props): React.JSX.Element => {
  const deviceColorScheme = useColorScheme();
  const colorScheme = useAppStore((state) => state.colorScheme);
  const themePreference = useAppStore((state) => state.themePreference);
  const setColorScheme = useAppStore((state) => state.setColorScheme);
  const theme = useTheme(colorScheme);

  useEffect(() => {
    const resolvedColorScheme =
      themePreference === 'system'
        ? deviceColorScheme === 'dark'
          ? 'dark'
          : 'light'
        : themePreference;

    setColorScheme(resolvedColorScheme);
  }, [deviceColorScheme, setColorScheme, themePreference]);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
};
