import { AppTheme, ThemeMode } from '@/types/theme';

const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: '#123B6D',
    primaryMuted: '#D8E4F4',
    secondary: '#0F8B8D',
    success: '#1F9D55',
    warning: '#D68C00',
    error: '#C0392B',
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#E8EEF6',
    border: '#D5DFEA',
    text: '#1F2933',
    textMuted: '#52606D',
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
      shadowColor: '#123B6D',
      shadowOpacity: 0.1,
      shadowRadius: 18,
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
    primary: '#74A7E8',
    primaryMuted: '#173252',
    secondary: '#3BC9C9',
    success: '#4CC38A',
    warning: '#F3B63F',
    error: '#F26D60',
    background: '#08111C',
    surface: '#0E1A29',
    surfaceAlt: '#13243A',
    border: '#1E3651',
    text: '#F3F7FB',
    textMuted: '#A8B5C3',
    textInverse: '#08111C',
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.32,
      shadowRadius: 22,
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
