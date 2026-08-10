import { create } from 'zustand';

import { ThemeMode, ThemePreference } from '@/types/theme';

type AppState = {
  hasSeenWelcome: boolean;
  colorScheme: ThemeMode;
  themePreference: ThemePreference;
  setHasSeenWelcome: (value: boolean) => void;
  setColorScheme: (value: ThemeMode) => void;
  setThemePreference: (value: ThemePreference) => void;
  toggleColorScheme: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  hasSeenWelcome: false,
  colorScheme: 'light',
  themePreference: 'system',
  setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
  setColorScheme: (value) =>
    set((state) => (state.colorScheme === value ? state : { colorScheme: value })),
  setThemePreference: (value) =>
    set((state) => (state.themePreference === value ? state : { themePreference: value })),
  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
      themePreference: state.colorScheme === 'light' ? 'dark' : 'light',
    })),
}));
