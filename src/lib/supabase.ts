import { createClient } from "@supabase/supabase-js";

// Read from the environment, never hardcode. The publishable key is safe to ship in the
// bundle by design, but a key pinned in source cannot be rotated without a code change,
// and that is what made the October 2026 rotation break the live site.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly at startup. A missing key used to surface much later as a broken
  // login screen, which is far harder to diagnose than a blank page with this message.
  throw new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. " +
      "Locally that means a .env.local file (copy .env.example), and on Vercel it means the " +
      "project's Environment Variables, followed by a redeploy."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  email_notifications: boolean;
  created_at: string;
};

export type Child = {
  id: string;
  profile_id: string;
  name: string;
  age: number;
  gender: string;
  interests: string[];
  language: string;
  created_at: string;
};
