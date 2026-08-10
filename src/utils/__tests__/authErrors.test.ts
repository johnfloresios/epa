import { translateAuthError } from '@/utils/authErrors';

describe('translateAuthError', () => {
  it('maps invalid credentials to a friendly message', () => {
    expect(translateAuthError(new Error('Invalid login credentials'))).toBe(
      'Invalid email or password.',
    );
  });

  it('maps duplicate accounts to a friendly message', () => {
    expect(translateAuthError(new Error('User already registered'))).toBe(
      'An account already exists with this email.',
    );
  });

  it('maps network failures to a friendly message', () => {
    expect(translateAuthError(new Error('Network request failed'))).toBe(
      'Unable to connect. Please try again.',
    );
  });
});
