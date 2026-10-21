import "server-only";

import { normaliseSettings } from "./data";
import { createServerSupabase } from "./supabase/server";
import type {
  AuditEntry,
  CampaignEvent,
  FeedbackState,
  FeedbackSubmission,
  ManifestoItem,
  ProgressItem,
  SiteSettings,
  UpdatePost,
  VisionPillar,
} from "./types";
import type { ContentStatus } from "./types";

/**
 * Administrator read layer.
 *
 * Uses the signed-in administrator's session, so row level security applies:
 * these queries can only ever return what `is_admin()` permits.
 */

async function client() {
  return createServerSupabase();
}

export async function adminGetSettings(): Promise<SiteSettings> {
  try {
    const supabase = await client();
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    return normaliseSettings(data as Record<string, unknown> | null);
  } catch {
    return normaliseSettings(null);
  }
}

export interface AdminUpdateRow extends UpdatePost {
  author_email?: string | null;
}

export async function adminListUpdates(status?: ContentStatus): Promise<UpdatePost[]> {
  try {
    const supabase = await client();
    let query = supabase.from("update_posts").select("*");
    if (status) query = query.eq("status", status);
    const { data, error } = await query
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data as UpdatePost[]) ?? [];
  } catch (error) {
    console.error("[admin] updates", error);
    return [];
  }
}

export async function adminGetUpdate(id: string): Promise<UpdatePost | null> {
  try {
    const supabase = await client();
    const { data } = await supabase.from("update_posts").select("*").eq("id", id).maybeSingle();
    return (data as UpdatePost) ?? null;
  } catch {
    return null;
  }
}

export async function adminListManifesto(): Promise<ManifestoItem[]> {
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("manifesto_items")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as ManifestoItem[]) ?? [];
  } catch (error) {
    console.error("[admin] manifesto", error);
    return [];
  }
}

export async function adminGetManifesto(id: string): Promise<ManifestoItem | null> {
  try {
    const supabase = await client();
    const { data } = await supabase
      .from("manifesto_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as ManifestoItem) ?? null;
  } catch {
    return null;
  }
}

export async function adminListVision(): Promise<VisionPillar[]> {
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("vision_pillars")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as VisionPillar[]) ?? [];
  } catch (error) {
    console.error("[admin] vision", error);
    return [];
  }
}

export async function adminGetVision(id: string): Promise<VisionPillar | null> {
  try {
    const supabase = await client();
    const { data } = await supabase.from("vision_pillars").select("*").eq("id", id).maybeSingle();
    return (data as VisionPillar) ?? null;
  } catch {
    return null;
  }
}

export async function adminListEvents(): Promise<CampaignEvent[]> {
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: false });
    if (error) throw error;
    return (data as CampaignEvent[]) ?? [];
  } catch (error) {
    console.error("[admin] events", error);
    return [];
  }
}

export async function adminGetEvent(id: string): Promise<CampaignEvent | null> {
  try {
    const supabase = await client();
    const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    return (data as CampaignEvent) ?? null;
  } catch {
    return null;
  }
}

export async function adminListProgress(): Promise<ProgressItem[]> {
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("progress_items")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as ProgressItem[]) ?? [];
  } catch (error) {
    console.error("[admin] progress", error);
    return [];
  }
}

export async function adminGetProgress(id: string): Promise<ProgressItem | null> {
  try {
    const supabase = await client();
    const { data } = await supabase.from("progress_items").select("*").eq("id", id).maybeSingle();
    return (data as ProgressItem) ?? null;
  } catch {
    return null;
  }
}

export async function adminListFeedback(state?: FeedbackState): Promise<FeedbackSubmission[]> {
  try {
    const supabase = await client();
    let query = supabase.from("feedback_submissions").select("*");
    if (state) query = query.eq("state", state);
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data as FeedbackSubmission[]) ?? [];
  } catch (error) {
    console.error("[admin] feedback", error);
    return [];
  }
}

export async function adminListAudit(limit = 8): Promise<AuditEntry[]> {
  try {
    const supabase = await client();
    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as AuditEntry[]) ?? [];
  } catch {
    return [];
  }
}

export interface DashboardData {
  published: number;
  drafts: number;
  scheduled: number;
  upcomingEvents: number;
  newFeedback: number;
  recent: { type: string; title: string; updatedAt: string; href: string }[];
  audit: AuditEntry[];
  nextEvent: CampaignEvent | null;
  latestFeedback: FeedbackSubmission | null;
}

async function countRows(
  supabase: Awaited<ReturnType<typeof client>>,
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build?: (query: any) => any,
): Promise<number> {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (build) query = build(query);
    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function adminDashboard(): Promise<DashboardData> {
  try {
    const supabase = await client();

    const [published, drafts, scheduled, newFeedback] = await Promise.all([
      countRows(supabase, "update_posts", (q) => q.eq("status", "published")),
      countRows(supabase, "update_posts", (q) => q.eq("status", "draft")),
      countRows(supabase, "update_posts", (q) => q.eq("status", "scheduled")),
      countRows(supabase, "feedback_submissions", (q) => q.eq("state", "new")),
    ]);

    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1);

    const upcomingEvents = await countRows(supabase, "events", (q) =>
      q.eq("is_published", true).gte("starts_at", new Date().toISOString()),
    );

    const { data: recentUpdates } = await supabase
      .from("update_posts")
      .select("id,title,slug,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);

    const { data: latestFeedback } = await supabase
      .from("feedback_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      published,
      drafts,
      scheduled,
      upcomingEvents,
      newFeedback,
      recent: ((recentUpdates as {
        id: string;
        title: string;
        slug: string;
        status: string;
        updated_at: string;
      }[]) ?? []).map((row) => ({
        type: row.status,
        title: row.title,
        updatedAt: row.updated_at,
        href: `/admin/updates/${row.id}`,
      })),
      audit: await adminListAudit(6),
      nextEvent: ((events as CampaignEvent[]) ?? [])[0] ?? null,
      latestFeedback: (latestFeedback as FeedbackSubmission) ?? null,
    };
  } catch (error) {
    console.error("[admin] dashboard", error);
    return {
      published: 0,
      drafts: 0,
      scheduled: 0,
      upcomingEvents: 0,
      newFeedback: 0,
      recent: [],
      audit: [],
      nextEvent: null,
      latestFeedback: null,
    };
  }
}
