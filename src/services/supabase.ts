import { createClient } from '@supabase/supabase-js';

// Fallback values ensure that web builds (e.g. Cloudflare CI where .env is not committed)
// do not crash on createClient() initialization.
const DEFAULT_SUPABASE_URL = 'https://nhszacrzcenlfzbccnub.supabase.co';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oc3phY3J6Y2VubGZ6YmNjbnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU3MTI2NCwiZXhwIjoyMTA2MTQ3MjY0fQ.bhgzEd0uSB58KDmq5GoGb2-BWP0bK5P0IqexetKjRTc';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

