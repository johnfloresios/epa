const includes = (value: string, needle: string): boolean =>
  value.toLowerCase().includes(needle.toLowerCase());

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message.trim();
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message.trim();
  }

  return '';
};

export const translatePracticeError = (error: unknown): string => {
  const message = getErrorMessage(error);

  if (!message) {
    return 'Unable to update practice progress right now. Please try again.';
  }

  if (
    includes(message, 'practice_sessions') ||
    includes(message, 'practice_answers') ||
    includes(message, 'exam_attempts') ||
    includes(message, 'exam_answers') ||
    includes(message, 'relation') && includes(message, 'does not exist') ||
    includes(message, 'column') && includes(message, 'does not exist')
  ) {
    return 'Supabase history tables are not fully set up yet. Run the latest practice and exam migrations, then try again.';
  }

  if (
    includes(message, 'network request failed') ||
    includes(message, 'fetch failed') ||
    includes(message, 'failed to fetch')
  ) {
    return 'Unable to connect. Please try again.';
  }

  if (includes(message, 'permission denied') || includes(message, 'row-level security')) {
    return 'You do not have access to that practice data.';
  }

  if (includes(message, 'duplicate key') || includes(message, 'unique constraint')) {
    return 'This practice response was already recorded.';
  }

  if (includes(message, 'missing supabase environment variables')) {
    return 'App configuration is incomplete. Please set the required environment variables.';
  }

  return 'Unable to update practice progress right now. Please try again.';
};
