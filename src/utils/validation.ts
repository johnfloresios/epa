import { SignInPayload, SignUpPayload } from '@/types/auth';

export const MIN_PASSWORD_LENGTH = 8;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignInErrors = Partial<Record<keyof SignInPayload, string>>;

export type SignUpErrors = Partial<
  Record<keyof SignUpPayload | 'confirmPassword', string>
>;

export const isValidEmail = (value: string): boolean => emailPattern.test(value.trim());

export const validateSignIn = (values: SignInPayload): SignInErrors => {
  const errors: SignInErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

export const validateSignUp = (
  values: SignUpPayload & { confirmPassword: string },
): SignUpErrors => {
  const errors: SignUpErrors = {};

  if (!values.displayName.trim()) {
    errors.displayName = 'Display name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};
