import React from 'react';

import { Card, ScreenContainer, Text } from '@/components';

export const ProfileScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer>
      <Text variant="heading" weight="bold">
        Profile
      </Text>
      <Card style={{ marginTop: 24 }}>
        <Text tone="muted">
          Profile preferences and account management will be connected once authentication is added.
        </Text>
      </Card>
    </ScreenContainer>
  );
};
