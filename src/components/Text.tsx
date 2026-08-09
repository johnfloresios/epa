import React from 'react';
import { StyleProp, StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

type Variant = 'title' | 'heading' | 'subheading' | 'body' | 'caption';

type Props = TextProps & {
  variant?: Variant;
  tone?: 'default' | 'muted' | 'inverse' | 'primary';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

const fontWeightMap = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Text = ({
  variant = 'body',
  tone = 'default',
  weight = 'regular',
  style,
  children,
  ...rest
}: Props): React.JSX.Element => {
  const theme = useAppTheme();

  const textStyle: StyleProp<TextStyle> = [
    styles.base,
    {
      color:
        tone === 'muted'
          ? theme.colors.textMuted
          : tone === 'inverse'
            ? theme.colors.textInverse
            : tone === 'primary'
              ? theme.colors.primary
              : theme.colors.text,
      fontSize:
        variant === 'title'
          ? theme.typography.title
          : variant === 'heading'
            ? theme.typography.heading
            : variant === 'subheading'
              ? theme.typography.subheading
              : variant === 'caption'
                ? theme.typography.caption
                : theme.typography.body,
      fontWeight: fontWeightMap[weight],
    },
    style,
  ];

  return (
    <RNText style={textStyle} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
