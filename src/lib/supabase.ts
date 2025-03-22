
import { createClient } from '@supabase/supabase-js';

// These are the public Supabase credentials from your project
const supabaseUrl = 'https://ckiicaqieuoincwtzjky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraWljYXFpZXVvaW5jd3R6amt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MDQ1OTEsImV4cCI6MjA1NjM4MDU5MX0.F9uC8URep_7Y-_Di4BoaiqjJkvZX8V-MVNhZqkzL3LQ';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
