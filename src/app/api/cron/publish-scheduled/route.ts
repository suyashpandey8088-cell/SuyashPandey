import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getServiceClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled publishing.
 *
 * Called by Vercel Cron (see vercel.json) with `Authorization: Bearer
 * $CRON_SECRET`. It promotes any update whose scheduled time has passed.
 *
 * The database function is idempotent — it only touches rows that are still
 * `scheduled` and whose time has come — so overlapping or repeated invocations
 * cannot double-publish or corrupt timestamps.
 *
 * The public policy also treats a due scheduled post as visible, which means a
 * delayed cron run never delays publication. This endpoint simply keeps the
 * stored status in step with reality.
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on this deployment." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  // Also accept Vercel's `x-vercel-cron` marker only when a secret is set and
  // an Authorization header matches; never trust the marker alone.
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase service credentials are not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("publish_scheduled_updates");

  if (error) {
    console.error("[cron] publish_scheduled_updates failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const published = Array.isArray(data) ? data.length : 0;

  if (published > 0) {
    for (const path of ["/", "/updates", "/sitemap.xml"]) {
      try {
        revalidatePath(path);
      } catch {
        /* dynamic pages do not need this */
      }
    }
  }

  return NextResponse.json(
    {
      ok: true,
      published,
      ranAt: new Date().toISOString(),
      slugs: Array.isArray(data)
        ? (data as { slug?: string }[]).map((row) => row.slug).filter(Boolean)
        : [],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
