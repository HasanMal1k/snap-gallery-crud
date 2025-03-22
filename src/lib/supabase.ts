
import { createClient } from '@supabase/supabase-js';

// These are the public Supabase credentials and are safe to expose in client-side code
const supabaseUrl = 'https://supabase-credentials-will-be-here.supabase.co';
const supabaseAnonKey = 'your-anon-key-will-be-here';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
