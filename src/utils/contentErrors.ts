const includes = (value: string, needle: string): boolean =>
  value.toLowerCase().includes(needle.toLowerCase());

export const translateContentError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Unable to load content right now. Please try again.';
  }

  const message = error.message.trim();

  if (
    includes(message, 'network request failed') ||
    includes(message, 'fetch failed') ||
    includes(message, 'failed to fetch')
  ) {
    return 'Unable to connect. Please try again.';
  }

  if (includes(message, 'permission denied') || includes(message, 'row-level security')) {
    return 'You do not have access to this content.';
  }

  if (includes(message, 'missing supabase environment variables')) {
    return 'App configuration is incomplete. Please set the required environment variables.';
  }

  return 'Unable to load content right now. Please try again.';
};
