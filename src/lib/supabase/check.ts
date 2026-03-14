/**
 * Shared helper: check whether Supabase env vars are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url !== "your-supabase-url" && url.startsWith("http");
}
