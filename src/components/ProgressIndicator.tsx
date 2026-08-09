import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { useAppTheme } from '@/theme/ThemeContext';

type Props = {
  label: string;
  progress: number;
};

export const ProgressIndicator = ({ label, progress }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const normalized = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text weight="semibold">{label}</Text>
        <Text tone="muted">{Math.round(normalized * 100)}%</Text>
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.pill,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.pill,
              width: `${normalized * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  fill: {
    height: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
});
