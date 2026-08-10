import React, { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { translateAuthError } from '@/utils/authErrors';

type Props = {
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const LogoutButton = ({
  fullWidth = false,
  variant = 'ghost',
}: Props): React.JSX.Element => {
  const signOut = useAuthStore((state) => state.signOut);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      Alert.alert('Unable to log out', translateAuthError(error));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      fullWidth={fullWidth}
      loading={isSigningOut}
      onPress={() => {
        void handleLogout();
      }}
      title="Log Out"
      variant={variant}
    />
  );
};
