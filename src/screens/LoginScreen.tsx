import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, Input, ScreenContainer, Text } from '@/components';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { AuthStackParamList } from '@/types/navigation';
import { translateAuthError } from '@/utils/authErrors';
import { validateSignIn } from '@/utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const pendingEmailConfirmationEmail = useAuthStore(
    (state) => state.pendingEmailConfirmationEmail,
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = async (): Promise<void> => {
    const errors = validateSignIn({ email, password });
    setFieldErrors(errors);
    setSubmitError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await signIn({
        email,
        password,
      });
    } catch (error) {
      const normalizedEmail = email.trim().toLowerCase();
      if (
        pendingEmailConfirmationEmail &&
        pendingEmailConfirmationEmail === normalizedEmail
      ) {
        setSubmitError(
          `Confirm the email sent to ${pendingEmailConfirmationEmail} before signing in.`,
        );
        return;
      }

      setSubmitError(translateAuthError(error));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="caption" tone="primary" weight="semibold">
          EPA 608 Ultimate
        </Text>
        <Text variant="heading" weight="bold">
          Sign In
        </Text>
        <Text tone="muted">
          Continue your Section 608 exam prep with secure account access.
        </Text>
      </View>
      <Card>
        <View style={styles.form}>
          {env.authRequiresEmailConfirmation && pendingEmailConfirmationEmail ? (
            <View
              style={[
                styles.message,
                {
                  backgroundColor: theme.colors.primaryMuted,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text tone="primary">
                Confirm the email sent to {pendingEmailConfirmationEmail} before signing in.
              </Text>
            </View>
          ) : null}
          <Input
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            error={fieldErrors.email}
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={email}
          />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldErrors.password}
            label="Password"
            onChangeText={setPassword}
            onSubmitEditing={() => {
              void handleSubmit();
            }}
            placeholder="Enter your password"
            secureTextEntry
            textContentType="password"
            value={password}
          />
          {submitError ? (
            <View
              style={[
                styles.message,
                {
                  backgroundColor: theme.colors.primaryMuted,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <Text tone="error">{submitError}</Text>
            </View>
          ) : null}
          <Button loading={isLoading} onPress={() => void handleSubmit()} title="Sign In" />
        </View>
      </Card>
      <View style={styles.footer}>
        <Text tone="muted">Don&apos;t have an account?</Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text tone="primary" weight="semibold">
            Create Account
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
  },
  form: {
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  message: {
    borderWidth: 1,
    padding: 14,
  },
});
