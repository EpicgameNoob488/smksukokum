import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isMissingKeys =
  !supabaseUrl ||
  supabaseUrl === 'https://your-project-ref.supabase.co' ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'your-anon-key-here';

// Supabase missing keys warning removed for production

// Provide fallback values so createClient never receives undefined
export const supabase = createClient(
  isMissingKeys ? 'https://placeholder.supabase.co' : supabaseUrl,
  isMissingKeys ? 'placeholder-anon-key' : supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

/** True when running without real Supabase credentials */
export const isOfflineMode = isMissingKeys;
