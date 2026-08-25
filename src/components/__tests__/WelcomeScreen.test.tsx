import React from 'react';
import { render } from '@testing-library/react-native';

import { AppProviders } from '@/providers/AppProviders';
import { WelcomeScreen } from '@/screens/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('offers login and sign up without a generic continue action', () => {
    const { getByText, queryByText } = render(
      <AppProviders>
        <WelcomeScreen
          navigation={{ navigate: jest.fn(), replace: jest.fn() } as never}
          onContinue={jest.fn()}
          route={{ key: 'Welcome', name: 'Welcome' } as never}
        />
      </AppProviders>,
    );

    expect(getByText('EPA 608 PRO')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(queryByText('Continue')).toBeNull();
  });
});
