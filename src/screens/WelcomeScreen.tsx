import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card, ScreenContainer, Text } from '@/components';
import { useAppTheme } from '@/theme/ThemeContext';
import { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'> & {
  onContinue: () => void;
};

export const WelcomeScreen = ({
  navigation,
  onContinue,
}: Props): React.JSX.Element => {
  const theme = useAppTheme();

  const handleContinue = (): void => {
    onContinue();
    navigation.navigate('Login');
  };

  return (
    <ScreenContainer scrollable={false}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        end={{ x: 1, y: 0.8 }}
        start={{ x: 0, y: 0 }}
        style={[styles.hero, { borderRadius: theme.radius.xl }]}
      >
        <Text tone="inverse" weight="semibold" style={styles.eyebrow}>
          EPA 608 PRO
        </Text>
        <Text tone="inverse" variant="title" weight="bold" style={styles.title}>
          Pass Your Exam With Confidence
        </Text>
        <Text tone="inverse" style={styles.subtitle}>
          Structured study, timed practice, and clear progress tracking for Section 608 certification prep.
        </Text>
      </LinearGradient>

      <Card style={styles.panel}>
        <View style={styles.copyBlock}>
          <Text variant="subheading" weight="semibold">
            Built for focused exam prep
          </Text>
          <Text tone="muted">
            The core study experience is staged for future phases. This foundation already supports theme, navigation, reusable UI, and auth-ready app flow.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Continue" onPress={handleContinue} />
          <Button title="Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
          <Button
            title="Sign Up"
            variant="secondary"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  copyBlock: {
    gap: 12,
  },
  eyebrow: {
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  hero: {
    gap: 16,
    justifyContent: 'flex-end',
    minHeight: 320,
    padding: 28,
    marginBottom: 16,
  },
  panel: {
    gap: 24,
    marginTop: -32,
  },
  subtitle: {
    lineHeight: 24,
    maxWidth: 320,
  },
  title: {
    lineHeight: 42,
    maxWidth: 300,
  },
});
