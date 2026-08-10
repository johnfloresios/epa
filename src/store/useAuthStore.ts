import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { authService } from '@/services/supabase/auth';
import { profileService } from '@/services/supabase/profiles';
import { AuthResult, SignInPayload, SignUpPayload, UserProfile } from '@/types/auth';

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  pendingEmailConfirmationEmail: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<AuthResult>;
  signUp: (payload: SignUpPayload) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<UserProfile>;
};

let hasInitialized = false;
let authSubscription: { unsubscribe: () => void } | null = null;

const applySession = async (
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
  session: Session | null,
  options?: { isInitializing?: boolean; isLoading?: boolean },
): Promise<void> => {
  const user = session?.user ?? null;
  let profile: UserProfile | null = null;

  if (user) {
    try {
      profile = await profileService.getProfile(user.id);
    } catch {
      profile = null;
    }
  }

  set({
    session,
    user,
    profile,
    pendingEmailConfirmationEmail: user
      ? null
      : get().pendingEmailConfirmationEmail,
    isAuthenticated: Boolean(user),
    isInitializing: options?.isInitializing ?? false,
    isLoading: options?.isLoading ?? false,
  });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  pendingEmailConfirmationEmail: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  initialize: async () => {
    if (hasInitialized) {
      set({ isInitializing: false });
      return;
    }

    hasInitialized = true;
    set({ isInitializing: true });

    if (!authSubscription) {
      const listener = authService.onAuthStateChange((session) => {
        void applySession(set, get, session, {
          isInitializing: false,
          isLoading: false,
        });
      });

      authSubscription = listener.data.subscription;
    }

    try {
      const { data, error } = await authService.getSession();

      if (error) {
        set({
          session: null,
          user: null,
          profile: null,
          pendingEmailConfirmationEmail: null,
          isAuthenticated: false,
          isInitializing: false,
        });
        throw error;
      }

      await applySession(set, get, data.session, {
        isInitializing: false,
        isLoading: false,
      });
    } catch {
      set({
        session: null,
        user: null,
        profile: null,
        pendingEmailConfirmationEmail: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },
  signIn: async (payload) => {
    set({ isLoading: true });

    try {
      const { data, error } = await authService.signIn(payload);

      if (error) {
        throw error;
      }

      await applySession(set, get, data.session, {
        isInitializing: false,
        isLoading: false,
      });

      return {
        session: data.session,
        user: data.user,
        requiresEmailConfirmation: false,
        pendingEmail: null,
      };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  signUp: async (payload) => {
    set({ isLoading: true });

    try {
      const { data, error } = await authService.signUp(payload);

      if (error) {
        throw error;
      }

      const requiresEmailConfirmation = !data.session;

      set({
        pendingEmailConfirmationEmail: requiresEmailConfirmation
          ? payload.email.trim().toLowerCase()
          : null,
      });

      await applySession(set, get, data.session, {
        isInitializing: false,
        isLoading: false,
      });

      return {
        session: data.session,
        user: data.user,
        requiresEmailConfirmation,
        pendingEmail: requiresEmailConfirmation
          ? payload.email.trim().toLowerCase()
          : null,
      };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  signOut: async () => {
    set({ isLoading: true });
    const { error } = await authService.signOut();

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    set({
      session: null,
      user: null,
      profile: null,
      pendingEmailConfirmationEmail: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  refreshProfile: async () => {
    const user = get().user;

    if (!user) {
      set({ profile: null });
      return;
    }

    const profile = await profileService.getProfile(user.id);
    set({ profile });
  },
  updateProfile: async (displayName) => {
    const user = get().user;

    if (!user) {
      throw new Error('You must be signed in to update your profile.');
    }

    set({ isLoading: true });
    try {
      const profile = await profileService.updateProfile(user.id, { displayName });
      set({
        profile,
        isLoading: false,
      });

      return profile;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
