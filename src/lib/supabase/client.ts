import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (singleton).
 * Use this in Client Components and client-side hooks.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * from .env.local (injected by Vercel in production).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
