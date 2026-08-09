import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from './src/providers/AppProviders';
import { RootNavigation } from './src/navigation/RootNavigation';
import { useTheme } from './src/theme/useTheme';
import { useAppStore } from './src/store/useAppStore';

const AppContent = (): React.JSX.Element => {
  const colorScheme = useAppStore((state) => state.colorScheme);
  const setHasSeenWelcome = useAppStore((state) => state.setHasSeenWelcome);
  const theme = useTheme(colorScheme);

  const handleContinue = (): void => {
    setHasSeenWelcome(true);
  };

  return (
    <>
      <StatusBar style={theme.statusBarStyle} />
      <RootNavigation onContinue={handleContinue} />
    </>
  );
};

export default function App(): React.JSX.Element {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
