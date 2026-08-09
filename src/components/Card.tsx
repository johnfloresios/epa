import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

type Props = ViewProps & {
  elevated?: boolean;
};

export const Card = ({
  elevated = true,
  style,
  children,
  ...rest
}: Props): React.JSX.Element => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        elevated ? theme.shadows.card : null,
        style as StyleProp<ViewStyle>,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 20,
  },
});
