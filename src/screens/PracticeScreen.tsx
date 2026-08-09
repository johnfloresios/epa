import React from 'react';

import { Card, ScreenContainer, Text } from '@/components';

export const PracticeScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer>
      <Text variant="heading" weight="bold">
        Practice
      </Text>
      <Card style={{ marginTop: 24 }}>
        <Text tone="muted">
          Practice modules will be added in a later phase. This screen confirms navigation and theming are wired correctly.
        </Text>
      </Card>
    </ScreenContainer>
  );
};
