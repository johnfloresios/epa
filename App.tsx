import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from './src/providers/AppProviders';
import { RootNavigation } from './src/navigation/RootNavigation';
import { useAuthStore } from './src/store/useAuthStore';
import { useTheme } from './src/theme/useTheme';
import { useAppStore } from './src/store/useAppStore';
import { usePremiumStore } from './src/store/usePremiumStore';
import { PremiumPaywall } from './src/components/PremiumPaywall';

const AppContent = (): React.JSX.Element => {
  const colorScheme = useAppStore((state) => state.colorScheme);
  const setHasSeenWelcome = useAppStore((state) => state.setHasSeenWelcome);
  const initialize = useAuthStore((state) => state.initialize);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const isAuthInitializing = useAuthStore((state) => state.isInitializing);
  const initializePremium = usePremiumStore((state) => state.initialize);
  const theme = useTheme(colorScheme);

  useEffect(() => {
    void initialize().catch(() => undefined);
  }, [initialize]);

  useEffect(() => {
    if (!isAuthInitializing) {
      void initializePremium(userId);
    }
  }, [initializePremium, isAuthInitializing, userId]);

  const handleContinue = (): void => {
    setHasSeenWelcome(true);
  };

  return (
    <>
      <StatusBar style={theme.statusBarStyle} />
      <RootNavigation onContinue={handleContinue} />
      <PremiumPaywall />
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
