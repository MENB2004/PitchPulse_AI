import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id") || supabaseAnonKey.includes("your-anon-key")) {
  console.warn(
    "Supabase configuration is not set up correctly. Please replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY inside 'frontend/.env.local' with your actual Supabase credentials."
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
