import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Input, ScreenContainer, Text } from '@/components';

export const SignUpScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="heading" weight="bold">
          Sign Up
        </Text>
        <Text tone="muted">
          Account creation will be connected to Supabase in a later phase.
        </Text>
      </View>
      <Card>
        <View style={styles.form}>
          <Input editable={false} label="Full Name" placeholder="Jane Technician" />
          <Input editable={false} label="Email" placeholder="you@example.com" />
          <Input editable={false} label="Password" placeholder="Create a password" secureTextEntry />
          <Button disabled title="Coming Soon" />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
});
