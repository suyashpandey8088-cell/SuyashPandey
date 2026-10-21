import "server-only";

import {
  DEFAULT_SETTINGS,
  FALLBACK_EVENTS,
  FALLBACK_MANIFESTO,
  FALLBACK_PROGRESS,
  FALLBACK_UPDATES,
  FALLBACK_VISION_PILLARS,
  SECTION_KEYS,
} from "./content-defaults";
import { getPublicClient } from "./supabase/public";

export { splitEvents } from "./events";
import type {
  CampaignEvent,
  UpdateCategory,
  UpdatePost,
} from "./types";

/**
 * Public read layer.
 *
 * Every function degrades to last-known-good content rather than throwing, so
 * a database hiccup shows the campaign, not an error page. Reads are always
 * `no-store`, which is what makes a newly published update appear on the next
 * request with no redeploy and no revalidation window.
 */

let warned = false;
function warnOnce(context: string, error: unknown) {
  if (warned) return;
  warned = true;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `[campaign:data] Falling back to bundled content (${context}): ${message}`,
  );
}

/* --------------------------------------------------------------- settings */

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normaliseSettings(row: Record<string, unknown> | null): typeof DEFAULT_SETTINGS {
  if (!row) return DEFAULT_SETTINGS;

  const rawSections = asRecord(row.sections);
  const sections: Record<string, boolean> = {};
  for (const key of SECTION_KEYS) {
    sections[key] =
      typeof rawSections[key] === "boolean" ? (rawSections[key] as boolean) : true;
  }

  const social = Array.isArray(row.social_links)
    ? (row.social_links as { label?: string; url?: string }[])
        .filter((item) => item && typeof item.url === "string")
        .map((item) => ({ label: String(item.label ?? "Link"), url: String(item.url) }))
        .slice(0, 8)
    : [];

  return {
    ...DEFAULT_SETTINGS,
    ...(row as Partial<typeof DEFAULT_SETTINGS>),
    sections,
    social_links: social,
  } as typeof DEFAULT_SETTINGS;
}

export async function getSettings(): Promise<typeof DEFAULT_SETTINGS> {
  const client = getPublicClient();
  if (!client) return DEFAULT_SETTINGS;
  try {
    const { data, error } = await client
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return normaliseSettings(data as Record<string, unknown> | null);
  } catch (error) {
    warnOnce("settings", error);
    return DEFAULT_SETTINGS;
  }
}

/* ------------------------------------------------------------------ lists */

export async function getVisionPillars() {
  const client = getPublicClient();
  if (!client) return FALLBACK_VISION_PILLARS;
  try {
    const { data, error } = await client
      .from("vision_pillars")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as typeof FALLBACK_VISION_PILLARS) ?? [];
  } catch (error) {
    warnOnce("vision", error);
    return FALLBACK_VISION_PILLARS;
  }
}

export async function getManifestoItems() {
  const client = getPublicClient();
  if (!client) return FALLBACK_MANIFESTO;
  try {
    const { data, error } = await client
      .from("manifesto_items")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as typeof FALLBACK_MANIFESTO) ?? [];
  } catch (error) {
    warnOnce("manifesto", error);
    return FALLBACK_MANIFESTO;
  }
}

export async function getManifestoItem(slug: string) {
  const items = await getManifestoItems();
  return items.find((item) => item.slug === slug) ?? null;
}

export async function getProgressItems() {
  const client = getPublicClient();
  if (!client) return FALLBACK_PROGRESS;
  try {
    const { data, error } = await client
      .from("progress_items")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as typeof FALLBACK_PROGRESS) ?? [];
  } catch (error) {
    warnOnce("progress", error);
    return FALLBACK_PROGRESS;
  }
}

export async function getEvents(): Promise<CampaignEvent[]> {
  const client = getPublicClient();
  if (!client) return FALLBACK_EVENTS;
  try {
    const { data, error } = await client
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return (data as CampaignEvent[]) ?? [];
  } catch (error) {
    warnOnce("events", error);
    return FALLBACK_EVENTS;
  }
}

/* ---------------------------------------------------------------- updates */

export interface UpdateQuery {
  limit?: number;
  offset?: number;
  category?: UpdateCategory | "all";
  includePinnedFirst?: boolean;
}

export interface UpdateListResult {
  items: UpdatePost[];
  total: number;
  hasMore: boolean;
}

export async function getUpdates({
  limit = 6,
  offset = 0,
  category = "all",
  includePinnedFirst = true,
}: UpdateQuery = {}): Promise<UpdateListResult> {
  const client = getPublicClient();
  if (!client) {
    const filtered =
      category === "all"
        ? FALLBACK_UPDATES
        : FALLBACK_UPDATES.filter((item) => item.category === category);
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  }

  try {
    // `public_updates` is a security_invoker view that already applies the
    // publication-time rule, including scheduled posts whose moment has come.
    let query = client.from("public_updates").select("*", { count: "exact" });

    if (category !== "all") query = query.eq("category", category);

    if (includePinnedFirst) query = query.order("is_pinned", { ascending: false });
    query = query
      .order("visible_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      items: (data as UpdatePost[]) ?? [],
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    warnOnce("updates", error);
    const filtered =
      category === "all"
        ? FALLBACK_UPDATES
        : FALLBACK_UPDATES.filter((item) => item.category === category);
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  }
}

export async function getUpdateBySlug(slug: string): Promise<UpdatePost | null> {
  const client = getPublicClient();
  if (!client) return FALLBACK_UPDATES.find((item) => item.slug === slug) ?? null;
  try {
    const { data, error } = await client
      .from("public_updates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as UpdatePost) ?? null;
  } catch (error) {
    warnOnce("update-detail", error);
    return FALLBACK_UPDATES.find((item) => item.slug === slug) ?? null;
  }
}

/**
 * The featured announcement: the administrator's explicit choice when set,
 * otherwise the pinned post, otherwise the most recent publication.
 */
export async function getFeaturedUpdate(settings: typeof DEFAULT_SETTINGS) {
  if (settings.featured_update_id) {
    const client = getPublicClient();
    if (client) {
      try {
        const { data } = await client
          .from("public_updates")
          .select("*")
          .eq("id", settings.featured_update_id)
          .maybeSingle();
        if (data) return data as UpdatePost;
      } catch {
        // fall through to the list-based selection
      }
    }
  }
  const { items } = await getUpdates({ limit: 1 });
  return items[0] ?? null;
}
