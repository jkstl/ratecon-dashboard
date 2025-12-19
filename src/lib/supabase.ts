import { createClient } from '@supabase/supabase-js';

// 1. Read the variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. The Safety Check (Pop up an alert if missing)
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  
  const msg = `CRITICAL ERROR: Missing API Keys!\n\nPlease check Cloudflare Pages Settings > Environment Variables.\n\nMissing: ${missing.join(", ")}`;
  
  // Alert the user on the phone screen
  alert(msg);
  
  // Stop execution to prevent white-screen crash
  throw new Error(msg);
}

// 3. Connect (Only if keys exist)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);