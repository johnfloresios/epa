const MIN_PASSWORD_LENGTH = 8;

const includes = (value: string, needle: string): boolean =>
  value.toLowerCase().includes(needle.toLowerCase());

export const translateAuthError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Something went wrong. Please try again.';
  }

  const message = error.message.trim();

  if (
    includes(message, 'network request failed') ||
    includes(message, 'fetch failed') ||
    includes(message, 'failed to fetch')
  ) {
    return 'Unable to connect. Please try again.';
  }

  if (includes(message, 'invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (includes(message, 'email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  if (includes(message, 'user already registered')) {
    return 'An account already exists with this email.';
  }

  if (includes(message, 'password should be at least')) {
    return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (includes(message, 'invalid email')) {
    return 'Please check your email address.';
  }

  if (includes(message, 'missing supabase environment variables')) {
    return 'App configuration is incomplete. Please set the required environment variables.';
  }

  if (includes(message, 'permission denied') || includes(message, 'row-level security')) {
    return 'You do not have access to that account data.';
  }

  if (includes(message, 'signup is disabled')) {
    return 'Account creation is currently unavailable.';
  }

  return 'Unable to complete authentication right now. Please try again.';
};
