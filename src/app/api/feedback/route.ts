import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { getServiceClient } from "@/lib/supabase/admin";
import { feedbackSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MINUTES = 10;
const MAX_PER_WINDOW = 3;

function clientFingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  const salt =
    process.env.FEEDBACK_HASH_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "campaign";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 40);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { ok: false, message: "Unsupported request format." },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errors: fieldErrors(parsed.error),
        message: "Please check the highlighted fields.",
      },
      { status: 422 },
    );
  }

  const input = parsed.data;

  // Silently accept honeypot hits so automated senders get no signal.
  if (input.website && input.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Form filled in faster than a human could read it.
  if (input.elapsedMs > 0 && input.elapsedMs < 2500) {
    return NextResponse.json(
      {
        ok: false,
        message: "That was submitted a little too quickly — please try once more.",
      },
      { status: 429 },
    );
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "The campaign inbox is not configured yet. Please try again later or reach out directly.",
      },
      { status: 503 },
    );
  }

  const fingerprint = clientFingerprint(request);

  try {
    // Durable, database-backed rate limit: survives serverless cold starts and
    // multiple concurrent instances, unlike an in-memory counter.
    const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    const { count, error: countError } = await supabase
      .from("feedback_submissions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", fingerprint)
      .gte("created_at", since);

    if (countError) throw countError;

    if ((count ?? 0) >= MAX_PER_WINDOW) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "You have sent a few messages already. Please give it ten minutes, or reply to the campaign another way.",
        },
        { status: 429 },
      );
    }

    const { error } = await supabase.from("feedback_submissions").insert({
      name: input.name?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      category: input.category,
      message: input.message.trim(),
      consent: input.consent,
      state: "new",
      ip_hash: fingerprint,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[feedback] submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Something went wrong at our end. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}
