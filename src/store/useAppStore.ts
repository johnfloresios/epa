import { create } from 'zustand';

import { ThemeMode } from '@/types/theme';

type AppState = {
  isAuthenticated: boolean;
  hasSeenWelcome: boolean;
  colorScheme: ThemeMode;
  setAuthenticated: (value: boolean) => void;
  setHasSeenWelcome: (value: boolean) => void;
  setColorScheme: (value: ThemeMode) => void;
  toggleColorScheme: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  hasSeenWelcome: false,
  colorScheme: 'light',
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
  setColorScheme: (value) =>
    set((state) => (state.colorScheme === value ? state : { colorScheme: value })),
  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
    })),
}));
