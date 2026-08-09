import React from 'react';

import { Card, ScreenContainer, Text } from '@/components';

export const ProgressScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer>
      <Text variant="heading" weight="bold">
        Progress
      </Text>
      <Card style={{ marginTop: 24 }}>
        <Text tone="muted">
          Progress analytics, session history, and performance summaries will be implemented in later phases.
        </Text>
      </Card>
    </ScreenContainer>
  );
};
