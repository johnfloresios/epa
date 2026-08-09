import { themes } from '@/theme/theme';
import { AppTheme, ThemeMode } from '@/types/theme';

export const useTheme = (mode: ThemeMode): AppTheme => {
  return themes[mode];
};
