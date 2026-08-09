import React, { createContext, useContext } from 'react';

import { AppTheme } from '@/types/theme';

const ThemeContext = createContext<AppTheme | null>(null);

type ThemeProviderProps = {
  theme: AppTheme;
  children: React.ReactNode;
};

export const ThemeProvider = ({ theme, children }: ThemeProviderProps): React.JSX.Element => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppTheme => {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return theme;
};
