import React from 'react';
import { render } from '@testing-library/react-native';

import { AppProviders } from '@/providers/AppProviders';
import { WelcomeScreen } from '@/screens/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the primary call to action', () => {
    const { getByText } = render(
      <AppProviders>
        <WelcomeScreen
          navigation={{ navigate: jest.fn(), replace: jest.fn() } as never}
          onContinue={jest.fn()}
          route={{ key: 'Welcome', name: 'Welcome' } as never}
        />
      </AppProviders>,
    );

    expect(getByText('EPA 608 PRO')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });
});
