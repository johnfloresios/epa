import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { Text } from '@/components/Text';
import { useAppTheme } from '@/theme/ThemeContext';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  style,
  disabled,
  ...rest
}: Props): React.JSX.Element => {
  const theme = useAppTheme();

  const backgroundColor =
    variant === 'secondary'
      ? theme.colors.secondary
      : variant === 'ghost'
        ? 'transparent'
        : theme.colors.primary;

  const borderColor = variant === 'ghost' ? theme.colors.border : backgroundColor;
  const textTone = variant === 'ghost' ? 'default' : 'inverse';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: pressed || disabled ? 0.8 : 1,
          width: fullWidth ? '100%' : undefined,
          borderRadius: theme.radius.pill,
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.colors.text : theme.colors.textInverse} />
      ) : (
        <Text tone={textTone} weight="semibold">
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
});
