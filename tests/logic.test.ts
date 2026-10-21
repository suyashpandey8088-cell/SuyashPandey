import assert from "node:assert/strict";
import test from "node:test";

import { splitEvents } from "../src/lib/events.ts";
import { excerpt, safeExternalUrl, slugify, splitHeadline } from "../src/lib/format.ts";
import { renderMarkdown } from "../src/lib/markdown.ts";
import { utcToZonedInput, zonedInputToUtc } from "../src/lib/time.ts";
import type { CampaignEvent } from "../src/lib/types.ts";
import { feedbackSchema, updateFormSchema } from "../src/lib/validation.ts";

/* ------------------------------------------------------------------ format */

test("slugify produces URL-safe slugs", () => {
  assert.equal(slugify("The Student Voice Initiative"), "the-student-voice-initiative");
  assert.equal(slugify("  NIAT Campaign Bulletin!  "), "niat-campaign-bulletin");
  assert.equal(slugify("Café — Everyone Belongs"), "cafe-everyone-belongs");
  assert.equal(slugify("---"), "");
});

test("splitHeadline breaks the slogan on sentence boundaries", () => {
  assert.deepEqual(splitHeadline("Your Voice. Our Campus. Our Future."), [
    "Your Voice.",
    "Our Campus.",
    "Our Future.",
  ]);
  assert.deepEqual(splitHeadline("One line only"), ["One line only"]);
  assert.deepEqual(splitHeadline("A\nB"), ["A", "B"]);
  assert.deepEqual(splitHeadline(""), []);
});

test("excerpt trims on word boundaries", () => {
  const result = excerpt("The quick brown fox jumps over the lazy dog", 20);
  assert.ok(result.endsWith("…"));
  assert.ok(result.length <= 21);
});

test("safeExternalUrl only allows http(s)", () => {
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl("data:text/html,<script>"), null);
  assert.equal(safeExternalUrl("https://example.com/a"), "https://example.com/a");
  assert.equal(safeExternalUrl(""), null);
});

/* ---------------------------------------------------------------- markdown */

test("markdown escapes raw HTML before formatting", () => {
  const html = renderMarkdown('<script>alert("x")</script>');
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("markdown renders the supported subset", () => {
  const html = renderMarkdown(
    "## A heading\n\nSome **bold** and *italic* text.\n\n- one\n- two\n\n> a quote",
  );
  assert.ok(html.includes("<h2>A heading</h2>"));
  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes("<em>italic</em>"));
  assert.ok(html.includes("<ul>"));
  assert.ok(html.includes("<li>one</li>"));
  assert.ok(html.includes("<blockquote>"));
});

test("markdown drops unsafe link schemes but keeps the label", () => {
  const html = renderMarkdown("[click me](javascript:alert(1))");
  assert.ok(!html.includes("javascript:"));
  assert.ok(html.includes("click me"));
});

test("markdown marks external links nofollow/noopener", () => {
  const html = renderMarkdown("[site](https://example.com)");
  assert.ok(html.includes('rel="noopener noreferrer nofollow"'));
});

/* -------------------------------------------------------------------- time */

test("zonedInputToUtc converts campaign-local time to UTC", () => {
  // Asia/Kolkata is UTC+05:30 with no daylight saving.
  assert.equal(
    zonedInputToUtc("2026-10-21T14:30", "Asia/Kolkata"),
    "2026-10-21T09:00:00.000Z",
  );
  assert.equal(zonedInputToUtc("2026-01-01T00:00", "Asia/Kolkata"), "2025-12-31T18:30:00.000Z");
  assert.equal(zonedInputToUtc("", "Asia/Kolkata"), null);
});

test("utcToZonedInput round-trips an instant", () => {
  const iso = "2026-10-21T09:00:00.000Z";
  const local = utcToZonedInput(iso, "Asia/Kolkata");
  assert.equal(local, "2026-10-21T14:30");
  assert.equal(zonedInputToUtc(local, "Asia/Kolkata"), iso);
});

test("timezone conversion survives a daylight-saving boundary", () => {
  // Europe/London moves from BST (+1) to GMT (0) on 2026-10-25.
  assert.equal(
    zonedInputToUtc("2026-07-01T12:00", "Europe/London"),
    "2026-07-01T11:00:00.000Z",
  );
  assert.equal(
    zonedInputToUtc("2026-12-01T12:00", "Europe/London"),
    "2026-12-01T12:00:00.000Z",
  );
});

/* ------------------------------------------------------------------ events */

function event(id: string, startsAt: string, endsAt?: string): CampaignEvent {
  return {
    id,
    slug: id,
    title: id,
    description: "",
    starts_at: startsAt,
    ends_at: endsAt ?? null,
    venue: "",
    cover_image_url: null,
    cover_image_alt: null,
    registration_url: null,
    additional_info: null,
    recap: null,
    gallery: [],
    state: "scheduled",
    is_published: true,
    created_at: startsAt,
    updated_at: startsAt,
  };
}

test("splitEvents separates upcoming from past and sorts each side", () => {
  const now = new Date("2026-10-21T12:00:00.000Z");
  const { upcoming, past } = splitEvents(
    [
      event("past-1", "2026-09-01T10:00:00.000Z"),
      event("future-2", "2026-11-20T10:00:00.000Z"),
      event("future-1", "2026-10-25T10:00:00.000Z"),
      event("past-2", "2026-08-01T10:00:00.000Z"),
    ],
    now,
  );

  assert.deepEqual(upcoming.map((item) => item.id), ["future-1", "future-2"]);
  assert.deepEqual(past.map((item) => item.id), ["past-1", "past-2"]);
});

test("an event that is still running counts as upcoming", () => {
  const now = new Date("2026-10-21T12:00:00.000Z");
  const { upcoming } = splitEvents(
    [event("running", "2026-10-21T09:00:00.000Z", "2026-10-21T18:00:00.000Z")],
    now,
  );
  assert.equal(upcoming.length, 1);
});

/* -------------------------------------------------------------- validation */

test("feedback rejects a too-short message", () => {
  const result = feedbackSchema.safeParse({ category: "idea", message: "hi" });
  assert.equal(result.success, false);
});

test("feedback accepts a normal submission", () => {
  const result = feedbackSchema.safeParse({
    category: "idea",
    message: "Please add more charging points in the library.",
    email: "student@example.com",
  });
  assert.equal(result.success, true);
});

test("feedback rejects malformed contact details", () => {
  const result = feedbackSchema.safeParse({
    category: "idea",
    message: "A perfectly long enough message.",
    email: "not-an-email",
  });
  assert.equal(result.success, false);
});

test("a scheduled update requires a schedule time", () => {
  const base = {
    title: "A scheduled post",
    slug: "a-scheduled-post",
    category: "announcements" as const,
    status: "scheduled" as const,
  };
  assert.equal(updateFormSchema.safeParse(base).success, false);
  assert.equal(
    updateFormSchema.safeParse({ ...base, scheduledFor: "2026-11-01T10:00" }).success,
    true,
  );
});

test("an update slug must be URL-safe", () => {
  const result = updateFormSchema.safeParse({
    title: "T",
    slug: "Not A Slug!",
    category: "announcements",
    status: "draft",
  });
  assert.equal(result.success, false);
});

test("update rejects a non-http external link", () => {
  const result = updateFormSchema.safeParse({
    title: "Valid title",
    slug: "valid-slug",
    category: "announcements",
    status: "draft",
    externalUrl: "javascript:alert(1)",
  });
  assert.equal(result.success, false);
});
