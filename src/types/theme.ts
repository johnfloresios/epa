export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'system' | ThemeMode;

export type ThemeColors = {
  primary: string;
  primaryMuted: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  typography: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
    caption: number;
  };
  shadows: {
    card: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
  };
  statusBarStyle: 'light' | 'dark';
};
