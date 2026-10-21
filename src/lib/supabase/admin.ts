import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "./env";

/**
 * Service-role client. Bypasses RLS, so it is only ever used for:
 *   - the scheduled-publishing endpoint
 *   - durable feedback rate limiting (counting recent submissions)
 * It is never imported into a client component and never sent to the browser.
 */
export function getServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;

  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: { "x-application-name": "niat-campaign-service" },
      fetch: (input, init) =>
        fetch(input as RequestInfo, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }),
    },
  });
}
