import { MIN_PASSWORD_LENGTH, validateSignIn, validateSignUp } from '@/utils/validation';

describe('validateSignIn', () => {
  it('returns field errors for invalid credentials', () => {
    expect(
      validateSignIn({
        email: 'bad-email',
        password: '',
      }),
    ).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password is required.',
    });
  });
});

describe('validateSignUp', () => {
  it('requires display name, email, password, and password confirmation', () => {
    expect(
      validateSignUp({
        displayName: '   ',
        email: '   ',
        password: '',
        confirmPassword: '',
      }),
    ).toEqual({
      confirmPassword: 'Please confirm your password.',
      displayName: 'Display name is required.',
      email: 'Email is required.',
      password: 'Password is required.',
    });
  });

  it('returns field errors for invalid sign-up values', () => {
    expect(
      validateSignUp({
        displayName: '',
        email: 'bad-email',
        password: '123',
        confirmPassword: '456',
      }),
    ).toEqual({
      confirmPassword: 'Passwords do not match.',
      displayName: 'Display name is required.',
      email: 'Enter a valid email address.',
      password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  });
});
