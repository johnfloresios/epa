import { AuthError, Session } from '@supabase/supabase-js';

import { SignInPayload, SignUpPayload } from '@/types/auth';
import { assertSupabaseConfigured, supabase } from '@/services/supabase/client';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const authService = {
  getSession: async () => {
    assertSupabaseConfigured();
    return supabase.auth.getSession();
  },
  onAuthStateChange: (callback: (session: Session | null) => void) => {
    assertSupabaseConfigured();
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
  signIn: async ({ email, password }: SignInPayload) => {
    assertSupabaseConfigured();
    return supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
  },
  signUp: async ({ displayName, email, password }: SignUpPayload) => {
    assertSupabaseConfigured();
    return supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    });
  },
  signOut: async () => {
    assertSupabaseConfigured();
    return supabase.auth.signOut();
  },
};

export const isSupabaseAuthError = (error: unknown): error is AuthError =>
  error instanceof AuthError;
