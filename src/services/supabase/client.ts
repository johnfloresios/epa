import 'react-native-url-polyfill/auto';

import { AppState } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';

import { env, hasSupabaseEnv } from '@/config/env';
import { secureStoreStorage } from '@/services/supabase/storage';
import { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder-anon-key',
  {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: secureStoreStorage,
    lock: processLock,
  },
  },
);

export const assertSupabaseConfigured = (): void => {
  if (!hasSupabaseEnv) {
    throw new Error(
      'Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
};

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
