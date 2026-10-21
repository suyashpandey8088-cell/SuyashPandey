/**
 * Supabase client factories.
 *
 * Three distinct clients, each with a different privilege level:
 *
 *  public.ts   anon key, no session, no cache  -> public site reads (RLS: published only)
 *  server.ts   anon key + the admin's cookie session -> admin reads/writes (RLS: is_admin())
 *  admin.ts    service-role key, server only   -> background jobs and rate limiting
 *
 * The service-role key is never imported by a client component.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SUPABASE_PUBLIC_BUCKET = "campaign-media";

/** Public URL for an object in the campaign media bucket. */
export function publicMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_PUBLIC_BUCKET}/${path.replace(/^\/+/, "")}`;
}
