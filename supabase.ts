import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qgtguvvrjmvpqknksmvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndGd1dnZyam12cHFrbmtzbXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2ODE0NTMsImV4cCI6MjEwMTI1NzQ1M30.KWhnbA_s46e5NZBe-WIWe9tI_upoxg8pgPrVC5-uNjs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
