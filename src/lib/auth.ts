import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createServerSupabase } from "./supabase/server";

/**
 * Authorisation is enforced in three independent places:
 *
 *  1. middleware.ts         — bounces unauthenticated visitors away from /admin
 *  2. requireAdmin()        — authoritative check for every admin render
 *                              and every server action
 *  3. Postgres RLS          — is_admin() on every write, so even a leaked
 *                              session cookie cannot touch content it doesn't own
 *
 * Layer 3 is the one that actually matters: the UI checks are for humans.
 */

export const getSessionUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
});

export const isAdministrator = cache(async (): Promise<boolean> => {
  const user = await getSessionUser();
  if (!user) return false;
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc("is_admin");
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
});

export interface AdminIdentity {
  id: string;
  email: string;
  displayName: string;
}

/**
 * Guard for admin pages and server actions. Visitors who are signed in but not
 * on the administrator allow-list are sent to the login screen with a clear
 * message rather than shown a 404 — the dashboard's existence is not a secret,
 * but its contents are.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login?reason=signin");

  const admin = await isAdministrator();
  if (!admin) redirect("/admin/login?reason=not-admin");

  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Administrator",
  };
}

/** For server actions: throws instead of redirecting. */
export async function assertAdminForAction(): Promise<AdminIdentity> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  const admin = await isAdministrator();
  if (!admin) throw new Error("Not authorised");
  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.full_name as string | undefined) ?? "Administrator",
  };
}
