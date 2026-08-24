import { AppTheme, ThemeMode } from '@/types/theme';

const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: '#7C3AED',
    primaryMuted: '#EDE9FE',
    secondary: '#0891B2',
    success: '#059669',
    warning: '#E11D73',
    error: '#E11D48',
    background: '#F8F6FC',
    surface: '#FFFFFF',
    surfaceAlt: '#F0EBF8',
    border: '#DED6EA',
    text: '#171020',
    textMuted: '#6F647E',
    textInverse: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  typography: {
    title: 36,
    heading: 28,
    subheading: 20,
    body: 16,
    caption: 13,
  },
  shadows: {
    card: {
      shadowColor: '#5B21B6',
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
  },
  statusBarStyle: 'dark',
};

const darkTheme: AppTheme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    primary: '#A855F7',
    primaryMuted: '#291548',
    secondary: '#22D3EE',
    success: '#34D399',
    warning: '#FB7185',
    error: '#F43F8C',
    background: '#090711',
    surface: '#141020',
    surfaceAlt: '#1D1730',
    border: '#302747',
    text: '#FAF8FF',
    textMuted: '#A49AB8',
    textInverse: '#090711',
  },
  shadows: {
    card: {
      shadowColor: '#5B21B6',
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  },
  statusBarStyle: 'light',
};

export const themes: Record<ThemeMode, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
