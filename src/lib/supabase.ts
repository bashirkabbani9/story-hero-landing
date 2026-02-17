import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://giklfzxmoydzstpirfcb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpa2xmenhtb3lkenN0cGlyZmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzMzMzMsImV4cCI6MjA4Njg0OTMzM30.6XEoNstpfFsY4d7mKTTQVDoP9SMOIrqUUm4VbggbXRA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
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
