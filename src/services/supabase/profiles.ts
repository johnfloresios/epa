import { UserProfile } from '@/types/auth';
import { assertSupabaseConfigured, supabase } from '@/services/supabase/client';

const PROFILE_COLUMNS = 'id, email, display_name, created_at, updated_at';

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const mapProfile = (profile: {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}): UserProfile => ({
  id: profile.id,
  email: profile.email,
  displayName: profile.display_name,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

export const profileService = {
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    assertSupabaseConfigured();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        return mapProfile(data);
      }

      if (attempt < 2) {
        await sleep(250 * (attempt + 1));
      }
    }

    return null;
  },
  updateProfile: async (
    userId: string,
    updates: { displayName: string },
  ): Promise<UserProfile> => {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName.trim(),
      })
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    return mapProfile(data);
  },
};
