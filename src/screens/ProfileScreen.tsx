import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';

import { Button, Card, Input, LogoutButton, ScreenContainer, Text } from '@/components';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';
import { ThemePreference } from '@/types/theme';
import { translateAuthError } from '@/utils/authErrors';
import { usePremiumStore } from '@/store/usePremiumStore';

const appearanceOptions: ThemePreference[] = ['system', 'light', 'dark'];

export const ProfileScreen = (): React.JSX.Element => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const metadataDisplayName =
    typeof user?.user_metadata.display_name === 'string'
      ? user.user_metadata.display_name.trim()
      : '';
  const savedDisplayName = profile?.displayName?.trim() || metadataDisplayName;
  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const premiumStatus = usePremiumStore((state) => state.status);
  const showPaywall = usePremiumStore((state) => state.showPaywall);
  const restorePremium = usePremiumStore((state) => state.restore);
  const isPurchasing = usePremiumStore((state) => state.isPurchasing);
  const appVersion = Constants.expoConfig?.version ?? 'Unknown';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    (Constants.expoConfig?.android?.versionCode
      ? String(Constants.expoConfig.android.versionCode)
      : null);

  useEffect(() => {
    setDisplayName(savedDisplayName);
  }, [savedDisplayName]);

  useEffect(() => {
    if (!profile && user) {
      void refreshProfile();
    }
  }, [profile, refreshProfile, user]);

  const handleSave = async (): Promise<void> => {
    if (!displayName.trim()) {
      setErrorMessage('Display name is required.');
      setMessage('');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(displayName);
      setErrorMessage('');
      setMessage('Display name updated.');
    } catch (error) {
      setMessage('');
      setErrorMessage(translateAuthError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setIsSigningOut(true);
      setMessage('');
      setErrorMessage('');
      await signOut();
    } catch (error) {
      setErrorMessage(translateAuthError(error));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="heading" weight="bold">
            Profile
          </Text>
          <LogoutButton />
        </View>
        <Text tone="muted">Manage your account identity and sign out securely.</Text>
      </View>
      <Card style={styles.card}>
        <View style={styles.section}>
          <Text variant="subheading" weight="semibold">
            Account
          </Text>
          <Input
            error={errorMessage && !displayName.trim() ? errorMessage : undefined}
            label="Display Name"
            onChangeText={setDisplayName}
            placeholder="Display name"
            value={displayName}
          />
          <Input
            editable={false}
            label="Email"
            value={profile?.email ?? user?.email ?? ''}
          />
          <Button
            disabled={isSigningOut}
            loading={isSaving || (isLoading && !isSigningOut)}
            onPress={() => {
              void handleSave();
            }}
            title="Save Changes"
          />
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold">
            Preferences
          </Text>
          <Text tone="muted">Appearance</Text>
          <View style={styles.preferenceRow}>
            {appearanceOptions.map((option) => {
              const isActive = themePreference === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => setThemePreference(option)}
                  style={[
                    styles.preferenceChip,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surfaceAlt,
                      borderColor: isActive
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                >
                  <Text
                    tone={isActive ? 'inverse' : 'default'}
                    variant="caption"
                    weight="semibold"
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold">Plan</Text>
          <View style={styles.infoRow}>
            <Text tone="muted">Access</Text>
            <Text tone={premiumStatus === 'premium' ? 'success' : 'default'} weight="bold">
              {premiumStatus === 'premium' ? 'PREMIUM' : 'FREE'}
            </Text>
          </View>
          {premiumStatus !== 'premium' ? (
            <Button onPress={showPaywall} title="View Premium" />
          ) : null}
          <Button
            loading={isPurchasing}
            onPress={() => void restorePremium()}
            title="Restore Purchase"
            variant="ghost"
          />
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold">
            About
          </Text>
          <View style={styles.infoRow}>
            <Text tone="muted">App</Text>
            <Text weight="semibold">EPA 608 PRO</Text>
          </View>
          <View style={styles.infoRow}>
            <Text tone="muted">Version</Text>
            <Text weight="semibold">{appVersion}</Text>
          </View>
          {buildNumber ? (
            <View style={styles.infoRow}>
              <Text tone="muted">Build</Text>
              <Text weight="semibold">{buildNumber}</Text>
            </View>
          ) : null}
        </View>

        {errorMessage && displayName.trim() ? <Text tone="error">{errorMessage}</Text> : null}
        {message ? <Text tone="success">{message}</Text> : null}
        <View style={styles.section}>
          <Text variant="subheading" weight="semibold">
            Account Actions
          </Text>
          <Text tone="muted">
            Logging out clears the persisted session on this device and returns you to the sign-in flow.
          </Text>
          <Button
            disabled={isSaving}
            loading={isSigningOut}
            onPress={() => {
              void handleLogout();
            }}
            title="Log Out"
            variant="secondary"
          />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 16,
    marginTop: 24,
  },
  header: {
    gap: 8,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preferenceChip: {
    borderWidth: 1,
    minWidth: 84,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  section: {
    gap: 12,
  },
});
