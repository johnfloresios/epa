import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  premium: string;
  white: string;
  gray: string;
  dark: string;
  light: string;
}

export const LIGHT_THEME: ThemeColors = {
  primary: '#6366F1',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  premium: '#FACC15',
  white: '#FFFFFF',
  gray: '#64748B',
  dark: '#0F172A',
  light: '#F8FAFC',
};

export const DARK_THEME: ThemeColors = {
  primary: '#6366F1',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  premium: '#FACC15',
  white: '#FFFFFF',
  gray: '#64748B',
  dark: '#F8FAFC',
  light: '#1E293B',
};

// For backward compatibility with existing imports
export const COLORS = {
  primary: '#6366F1',
  dark: '#0F172A',
  gray: '#64748B',
  light: '#F8FAFC',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#E2E8F0',
  premium: '#FACC15',
  error: '#EF4444',
};

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = mode === 'light' ? LIGHT_THEME : DARK_THEME;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
