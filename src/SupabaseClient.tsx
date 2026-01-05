/**
 * Supabase client configuration
 *
 * In browser environment, uses Next.js public env vars
 * In Node/Bun environment (dev server, build), uses Bun.secrets via config.ts
 */
import { createClient } from "@supabase/supabase-js";

// For browser environment, Next.js will inject these at build time
// For server-side/build environment, they'll be loaded via Bun.secrets
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration. " +
      "For development: Run 'bun run setup' to configure credentials. " +
      "For production: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
  },
});
