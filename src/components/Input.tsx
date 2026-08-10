import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { Text } from '@/components/Text';
import { useAppTheme } from '@/theme/ThemeContext';

type Props = TextInputProps & {
  error?: string;
  label?: string;
};

export const Input = ({
  error,
  label,
  style,
  ...rest
}: Props): React.JSX.Element => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="caption" tone="muted" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
            borderRadius: theme.radius.md,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text tone="error" variant="caption" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    marginBottom: 8,
  },
  error: {
    marginTop: 8,
  },
});
