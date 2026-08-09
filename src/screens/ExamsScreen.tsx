import React from 'react';

import { Card, ScreenContainer, Text } from '@/components';

export const ExamsScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer>
      <Text variant="heading" weight="bold">
        Exams
      </Text>
      <Card style={{ marginTop: 24 }}>
        <Text tone="muted">
          Timed exam simulation is intentionally deferred.
        </Text>
      </Card>
    </ScreenContainer>
  );
};
