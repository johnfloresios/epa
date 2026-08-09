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
  const setColorScheme = useAppStore((state) => state.setColorScheme);
  const theme = useTheme(colorScheme);

  useEffect(() => {
    setColorScheme(deviceColorScheme === 'dark' ? 'dark' : 'light');
  }, [deviceColorScheme, setColorScheme]);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
};
