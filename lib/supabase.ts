import { createClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase client for use in browser components.
 * Uses the Anon Key.
 */
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required for client-side usage.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Server-side Supabase client for use in API routes and Server Components.
 * Uses the Service Role Key for elevated permissions.
 * WARNING: Never use the Service Role Key on the client side.
 */
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and Service Role Key are required for server-side usage.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
};
