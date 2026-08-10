import { Session, User } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  displayName: string;
  email: string;
  password: string;
};

export type AuthResult = {
  session: Session | null;
  user: User | null;
  requiresEmailConfirmation: boolean;
  pendingEmail: string | null;
};
