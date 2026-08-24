export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  authRequiresEmailConfirmation:
    process.env.EXPO_PUBLIC_AUTH_REQUIRE_EMAIL_CONFIRMATION === 'true',
  revenueCatAppleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ?? '',
  revenueCatGoogleApiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY ?? '',
};

export const hasSupabaseEnv = Boolean(env.supabaseUrl && env.supabaseAnonKey);
