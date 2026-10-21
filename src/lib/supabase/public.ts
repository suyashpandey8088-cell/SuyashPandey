import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Read-only client for public pages.
 *
 * `cache: "no-store"` guarantees that a newly published update is visible on
 * the very next request — no redeploy and no stale ISR window. RLS still
 * restricts every read to content that is genuinely public.
 */
let cached: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        headers: { "x-application-name": "niat-campaign-public" },
        fetch: (input, init) =>
          fetch(input as RequestInfo, {
            ...init,
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          }),
      },
    });
  }
  return cached;
}
