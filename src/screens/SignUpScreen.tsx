import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Card, Input, ScreenContainer, Text } from '@/components';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { AuthStackParamList } from '@/types/navigation';
import { translateAuthError } from '@/utils/authErrors';
import { validateSignUp } from '@/utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen = ({ navigation }: Props): React.JSX.Element => {
  const theme = useAppTheme();
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (): Promise<void> => {
    const errors = validateSignUp({
      displayName,
      email,
      password,
      confirmPassword,
    });

    setFieldErrors(errors);
    setSubmitError('');
    setSuccessMessage('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const result = await signUp({
        displayName,
        email,
        password,
      });

      if (result.requiresEmailConfirmation) {
        if (env.authRequiresEmailConfirmation) {
          setSuccessMessage(
            `Account created for ${result.pendingEmail ?? email.trim().toLowerCase()}. Check your email and confirm your address before signing in.`,
          );
          navigation.navigate('Login');
        } else {
          setSubmitError(
            'This Supabase project still requires email confirmation. Disable Confirm Email in the Supabase dashboard or set EXPO_PUBLIC_AUTH_REQUIRE_EMAIL_CONFIRMATION=true.',
          );
        }
      }
    } catch (error) {
      setSubmitError(translateAuthError(error));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="caption" tone="primary" weight="semibold">
          EPA 608 PRO
        </Text>
        <Text variant="heading" weight="bold">
          Create Account
        </Text>
        <Text tone="muted">
          Build your account to save your progress and continue across devices.
        </Text>
      </View>
      <Card>
        <View style={styles.form}>
          <Input
            autoCapitalize="words"
            error={fieldErrors.displayName}
            label="Display Name"
            onChangeText={setDisplayName}
            placeholder="Jane Technician"
            textContentType="name"
            value={displayName}
          />
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
            placeholder="Create a password"
            secureTextEntry
            textContentType="newPassword"
            value={password}
          />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldErrors.confirmPassword}
            label="Confirm Password"
            onChangeText={setConfirmPassword}
            onSubmitEditing={() => {
              void handleSubmit();
            }}
            placeholder="Confirm your password"
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
          />
          {submitError ? (
            <View
              style={[
                styles.message,
                {
                  backgroundColor: theme.colors.primaryMuted,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text tone="error">{submitError}</Text>
            </View>
          ) : null}
          {successMessage ? (
            <View
              style={[
                styles.message,
                {
                  backgroundColor: theme.colors.primaryMuted,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text tone="success">{successMessage}</Text>
            </View>
          ) : null}
          <Button
            loading={isLoading}
            onPress={() => {
              void handleSubmit();
            }}
            title="Create Account"
          />
        </View>
      </Card>
      <View style={styles.footer}>
        <Text tone="muted">Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text tone="primary" weight="semibold">
            Sign In
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
    borderRadius: 14,
    padding: 14,
  },
});
