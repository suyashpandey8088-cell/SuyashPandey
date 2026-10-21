"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/action-state";
import { assertAdminForAction } from "@/lib/auth";
import { SECTION_KEYS } from "@/lib/content-defaults";
import { DEFAULT_TIMEZONE } from "@/lib/format";
import { nowIso, zonedInputToUtc } from "@/lib/time";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  eventFormSchema,
  feedbackSchema,
  fieldErrors,
  loginSchema,
  manifestoFormSchema,
  parseGallery,
  parseSocialLinks,
  passwordSchema,
  progressFormSchema,
  settingsFormSchema,
  updateFormSchema,
  visionFormSchema,
} from "@/lib/validation";
import type { SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ utils */

function revalidatePublic() {
  const paths = ["/", "/updates", "/manifesto", "/events", "/admin", "/sitemap.xml"];
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      /* revalidation is best-effort; public pages are dynamic anyway */
    }
  }
}

async function audit(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    await supabase.from("audit_log").insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      details,
    });
  } catch {
    // An audit failure must never block the administrator's actual change.
  }
}

async function editorialTimezone(supabase: SupabaseClient): Promise<string> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("timezone")
      .eq("id", 1)
      .maybeSingle();
    return (data?.timezone as string) || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function bool(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

function uniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

/* ------------------------------------------------------------------- auth */

export async function signInAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: str(formData.get("email")),
    password: str(formData.get("password")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Please check your sign-in details.",
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately indistinguishable: never reveal whether an address exists.
    return {
      ok: false,
      message: "Those details do not match an authorised account.",
    };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "This account is not authorised to manage the campaign. Only the campaign owner can sign in.",
    };
  }

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const parsed = passwordSchema.safeParse({
    password: str(formData.get("password")),
    confirm: str(formData.get("confirm")),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), message: "Check the new password." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message || "The password could not be changed." };
  }

  await audit(supabase, actor.id, "password.changed", "auth", actor.id);
  return { ok: true, message: "Password updated. Use it the next time you sign in." };
}

/* ---------------------------------------------------------------- uploads */

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Verify the file's magic bytes rather than trusting the supplied MIME type. */
function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...Array.from(bytes.slice(start, end)));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && (ascii(8, 12).startsWith("avif") || ascii(8, 12).startsWith("avis"))) {
    return "image/avif";
  }
  return null;
}

export async function uploadImageAction(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const actor = await assertAdminForAction();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Choose an image file first." };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Images must be 8 MB or smaller." };
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const sniffed = sniffImageType(buffer);
    if (!sniffed || !ALLOWED_IMAGE_TYPES.includes(sniffed)) {
      return { ok: false, error: "Use a JPEG, PNG, WebP or AVIF image." };
    }

    const extension =
      sniffed === "image/jpeg"
        ? "jpg"
        : sniffed === "image/png"
          ? "png"
          : sniffed === "image/webp"
            ? "webp"
            : "avif";

    const folder = str(formData.get("folder")).replace(/[^a-z0-9-]/gi, "") || "uploads";
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

    const supabase = await createServerSupabase();
    const { error } = await supabase.storage
      .from("campaign-media")
      .upload(path, buffer, { contentType: sniffed, upsert: false, cacheControl: "31536000" });

    if (error) return { ok: false, error: error.message };

    const { data } = supabase.storage.from("campaign-media").getPublicUrl(path);
    await audit(supabase, actor.id, "media.uploaded", "media", path, { bytes: file.size, type: sniffed });

    return { ok: true, url: data.publicUrl };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}

/* ---------------------------------------------------------------- updates */

export async function saveUpdateAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const supabase = await createServerSupabase();
  const timezone = await editorialTimezone(supabase);

  const input = {
    id: str(formData.get("id")) || undefined,
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    summary: str(formData.get("summary")),
    body: str(formData.get("body")),
    category: str(formData.get("category")),
    status: str(formData.get("status")),
    publishedAt: str(formData.get("publishedAt")),
    scheduledFor: str(formData.get("scheduledFor")),
    coverImageUrl: str(formData.get("coverImageUrl")),
    coverImageAlt: str(formData.get("coverImageAlt")),
    galleryJson: str(formData.get("galleryJson")) || "[]",
    relatedManifestoId: str(formData.get("relatedManifestoId")),
    externalUrl: str(formData.get("externalUrl")),
    externalLabel: str(formData.get("externalLabel")),
    isPinned: bool(formData.get("isPinned")),
  };

  const parsed = updateFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Some fields need attention before this can be saved.",
    };
  }

  const data = parsed.data;
  const publishedAtIso = zonedInputToUtc(data.publishedAt, timezone);
  const scheduledIso = zonedInputToUtc(data.scheduledFor, timezone);

  const payload = {
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    body: data.body,
    category: data.category,
    status: data.status,
    published_at:
      data.status === "published" ? publishedAtIso ?? nowIso() : publishedAtIso,
    scheduled_for: data.status === "scheduled" ? scheduledIso : null,
    cover_image_url: data.coverImageUrl,
    cover_image_alt: data.coverImageAlt || null,
    gallery: parseGallery(data.galleryJson),
    related_manifesto_id: data.relatedManifestoId ?? null,
    external_url: data.externalUrl,
    external_label: data.externalLabel || null,
    is_pinned: data.isPinned,
  };

  if (data.id) {
    const { error } = await supabase.from("update_posts").update(payload).eq("id", data.id);
    if (error) {
      if (uniqueViolation(error)) {
        return { ok: false, errors: { slug: "That slug is already in use." } };
      }
      return { ok: false, message: error.message };
    }
    await audit(supabase, actor.id, `update.${data.status}`, "update_posts", data.id, {
      title: data.title,
    });
  } else {
    const { data: inserted, error } = await supabase
      .from("update_posts")
      .insert({ ...payload, author_id: actor.id })
      .select("id")
      .single();
    if (error) {
      if (uniqueViolation(error)) {
        return { ok: false, errors: { slug: "That slug is already in use." } };
      }
      return { ok: false, message: error.message };
    }
    await audit(supabase, actor.id, `update.${data.status}`, "update_posts", inserted?.id ?? null, {
      title: data.title,
    });
  }

  revalidatePublic();

  const message =
    data.status === "published"
      ? "Published. It is live on the public site now."
      : data.status === "scheduled"
        ? "Scheduled. It will publish automatically at the time you chose."
        : data.status === "archived"
          ? "Archived. It is no longer visible publicly."
          : "Draft saved. Only you can see it.";

  return { ok: true, message };
}

export async function setUpdateStatusAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !["draft", "scheduled", "published", "archived"].includes(status)) return;

  const supabase = await createServerSupabase();
  const patch: Record<string, unknown> = { status };

  if (status === "published") {
    patch.published_at = nowIso();
    patch.scheduled_for = null;
  }
  if (status === "draft") {
    patch.scheduled_for = null;
  }

  await supabase.from("update_posts").update(patch).eq("id", id);
  await audit(supabase, actor.id, `update.${status}`, "update_posts", id);
  revalidatePublic();
}

export async function deleteUpdateAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  if (!id) return;

  const supabase = await createServerSupabase();
  await supabase.from("update_posts").delete().eq("id", id);
  await audit(supabase, actor.id, "update.deleted", "update_posts", id);
  revalidatePublic();
  redirect("/admin/updates?deleted=1");
}

/* -------------------------------------------------------------- manifesto */

export async function saveManifestoAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const supabase = await createServerSupabase();

  const parsed = manifestoFormSchema.safeParse({
    id: str(formData.get("id")) || undefined,
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    category: str(formData.get("category")),
    issue: str(formData.get("issue")),
    proposal: str(formData.get("proposal")),
    whyItMatters: str(formData.get("whyItMatters")),
    outcome: str(formData.get("outcome")),
    firstStep: str(formData.get("firstStep")),
    considerations: str(formData.get("considerations")),
    status: str(formData.get("status")),
    displayOrder: str(formData.get("displayOrder")) || 0,
    isVisible: bool(formData.get("isVisible")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Check the highlighted fields.",
    };
  }

  const input = parsed.data;
  const payload = {
    title: input.title,
    slug: input.slug,
    category: input.category,
    issue: input.issue,
    proposal: input.proposal,
    why_it_matters: input.whyItMatters,
    outcome: input.outcome,
    first_step: input.firstStep,
    considerations: input.considerations,
    status: input.status,
    display_order: input.displayOrder,
    is_visible: input.isVisible,
  };

  const { error } = input.id
    ? await supabase.from("manifesto_items").update(payload).eq("id", input.id)
    : await supabase.from("manifesto_items").insert(payload);

  if (error) {
    if (uniqueViolation(error)) {
      return { ok: false, errors: { slug: "That slug is already in use." } };
    }
    return { ok: false, message: error.message };
  }

  await audit(supabase, actor.id, input.id ? "manifesto.updated" : "manifesto.created", "manifesto_items", input.id ?? null, { title: input.title });
  revalidatePublic();
  return { ok: true, message: "Manifesto item saved. The public page is updated." };
}

export async function deleteManifestoAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = await createServerSupabase();
  await supabase.from("manifesto_items").delete().eq("id", id);
  await audit(supabase, actor.id, "manifesto.deleted", "manifesto_items", id);
  revalidatePublic();
  redirect("/admin/manifesto?deleted=1");
}

/* ----------------------------------------------------------------- events */

export async function saveEventAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const supabase = await createServerSupabase();
  const timezone = await editorialTimezone(supabase);

  const parsed = eventFormSchema.safeParse({
    id: str(formData.get("id")) || undefined,
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    description: str(formData.get("description")),
    startsAt: str(formData.get("startsAt")),
    endsAt: str(formData.get("endsAt")),
    venue: str(formData.get("venue")),
    coverImageUrl: str(formData.get("coverImageUrl")),
    coverImageAlt: str(formData.get("coverImageAlt")),
    registrationUrl: str(formData.get("registrationUrl")),
    additionalInfo: str(formData.get("additionalInfo")),
    recap: str(formData.get("recap")),
    state: str(formData.get("state")),
    isPublished: bool(formData.get("isPublished")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Check the highlighted fields.",
    };
  }

  const input = parsed.data;
  const startsAt = zonedInputToUtc(input.startsAt, timezone);
  if (!startsAt) {
    return { ok: false, errors: { startsAt: "Enter a valid start date and time." } };
  }

  const payload = {
    title: input.title,
    slug: input.slug,
    description: input.description,
    starts_at: startsAt,
    ends_at: zonedInputToUtc(input.endsAt, timezone),
    venue: input.venue,
    cover_image_url: input.coverImageUrl,
    cover_image_alt: input.coverImageAlt || null,
    registration_url: input.registrationUrl,
    additional_info: input.additionalInfo || null,
    recap: input.recap || null,
    state: input.state,
    is_published: input.isPublished,
  };

  const { error } = input.id
    ? await supabase.from("events").update(payload).eq("id", input.id)
    : await supabase.from("events").insert(payload);

  if (error) {
    if (uniqueViolation(error)) {
      return { ok: false, errors: { slug: "That slug is already in use." } };
    }
    return { ok: false, message: error.message };
  }

  await audit(supabase, actor.id, input.id ? "event.updated" : "event.created", "events", input.id ?? null, { title: input.title });
  revalidatePublic();
  return {
    ok: true,
    message: input.isPublished
      ? "Event saved and published to the public calendar."
      : "Event saved as unpublished. It is not on the public site.",
  };
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = await createServerSupabase();
  await supabase.from("events").delete().eq("id", id);
  await audit(supabase, actor.id, "event.deleted", "events", id);
  revalidatePublic();
  redirect("/admin/events?deleted=1");
}

/* --------------------------------------------------------------- progress */

export async function saveProgressAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const supabase = await createServerSupabase();

  const parsed = progressFormSchema.safeParse({
    id: str(formData.get("id")) || undefined,
    initiativeName: str(formData.get("initiativeName")),
    originalProposal: str(formData.get("originalProposal")),
    status: str(formData.get("status")),
    progressNote: str(formData.get("progressNote")),
    percent: str(formData.get("percent")),
    relatedUpdateId: str(formData.get("relatedUpdateId")),
    displayOrder: str(formData.get("displayOrder")) || 0,
    isVisible: bool(formData.get("isVisible")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Check the highlighted fields.",
    };
  }

  const input = parsed.data;
  const payload = {
    initiative_name: input.initiativeName,
    original_proposal: input.originalProposal,
    status: input.status,
    progress_note: input.progressNote,
    percent: input.percent,
    related_update_id: input.relatedUpdateId ?? null,
    display_order: input.displayOrder,
    is_visible: input.isVisible,
  };

  const { error } = input.id
    ? await supabase.from("progress_items").update(payload).eq("id", input.id)
    : await supabase.from("progress_items").insert(payload);

  if (error) return { ok: false, message: error.message };

  await audit(supabase, actor.id, input.id ? "progress.updated" : "progress.created", "progress_items", input.id ?? null, { initiative: input.initiativeName });
  revalidatePublic();
  return { ok: true, message: "Progress entry saved." };
}

export async function deleteProgressAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = await createServerSupabase();
  await supabase.from("progress_items").delete().eq("id", id);
  await audit(supabase, actor.id, "progress.deleted", "progress_items", id);
  revalidatePublic();
  redirect("/admin/progress?deleted=1");
}

/* ----------------------------------------------------------------- vision */

export async function saveVisionAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const supabase = await createServerSupabase();

  const parsed = visionFormSchema.safeParse({
    id: str(formData.get("id")) || undefined,
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    kicker: str(formData.get("kicker")),
    summary: str(formData.get("summary")),
    studentNeed: str(formData.get("studentNeed")),
    approach: str(formData.get("approach")),
    benefit: str(formData.get("benefit")),
    status: str(formData.get("status")),
    displayOrder: str(formData.get("displayOrder")) || 0,
    isVisible: bool(formData.get("isVisible")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Check the highlighted fields.",
    };
  }

  const input = parsed.data;
  const payload = {
    title: input.title,
    slug: input.slug,
    kicker: input.kicker,
    summary: input.summary,
    student_need: input.studentNeed,
    approach: input.approach,
    benefit: input.benefit,
    status: input.status,
    display_order: input.displayOrder,
    is_visible: input.isVisible,
  };

  const { error } = input.id
    ? await supabase.from("vision_pillars").update(payload).eq("id", input.id)
    : await supabase.from("vision_pillars").insert(payload);

  if (error) {
    if (uniqueViolation(error)) {
      return { ok: false, errors: { slug: "That slug is already in use." } };
    }
    return { ok: false, message: error.message };
  }

  await audit(supabase, actor.id, input.id ? "vision.updated" : "vision.created", "vision_pillars", input.id ?? null, { title: input.title });
  revalidatePublic();
  return { ok: true, message: "Vision pillar saved." };
}

export async function deleteVisionAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  if (!id) return;
  const supabase = await createServerSupabase();
  await supabase.from("vision_pillars").delete().eq("id", id);
  await audit(supabase, actor.id, "vision.deleted", "vision_pillars", id);
  revalidatePublic();
  redirect("/admin/vision?deleted=1");
}

/* --------------------------------------------------------------- settings */

export async function saveSettingsAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await assertAdminForAction();
  const supabase = await createServerSupabase();

  // A partial form (the profile page) must not silently wipe the section
  // visibility map or the social links, so only a full settings submission is
  // allowed to rewrite them.
  const fullSettings = str(formData.get("fullSettings")) === "1";
  const sections: Record<string, boolean> = {};
  for (const key of SECTION_KEYS) {
    sections[key] = fullSettings ? bool(formData.get(`section_${key}`)) : true;
  }

  let preservedSections: Record<string, boolean> | null = null;
  let preservedSocial: unknown[] | null = null;
  if (!fullSettings) {
    const { data: current } = await supabase
      .from("site_settings")
      .select("sections, social_links")
      .eq("id", 1)
      .maybeSingle();
    const raw = (current?.sections ?? {}) as Record<string, boolean>;
    preservedSections = {};
    for (const key of SECTION_KEYS) {
      preservedSections[key] = raw[key] !== false;
    }
    preservedSocial = Array.isArray(current?.social_links)
      ? (current?.social_links as unknown[])
      : [];
  }

  const parsed = settingsFormSchema.safeParse({
    candidateName: str(formData.get("candidateName")),
    campaignSlogan: str(formData.get("campaignSlogan")),
    institution: str(formData.get("institution")),
    positionLabel: str(formData.get("positionLabel")),
    heroEyebrow: str(formData.get("heroEyebrow")),
    heroHeadline: str(formData.get("heroHeadline")),
    heroSupporting: str(formData.get("heroSupporting")),
    portraitUrl: str(formData.get("portraitUrl")),
    portraitAlt: str(formData.get("portraitAlt")),
    monogram: str(formData.get("monogram")),
    logoUrl: str(formData.get("logoUrl")),
    logoAlt: str(formData.get("logoAlt")),
    statementHeading: str(formData.get("statementHeading")),
    statementBody: str(formData.get("statementBody")),
    aboutHeading: str(formData.get("aboutHeading")),
    aboutBody: str(formData.get("aboutBody")),
    aboutPhilosophy: str(formData.get("aboutPhilosophy")),
    aboutInvolvement: str(formData.get("aboutInvolvement")),
    aboutMotivation: str(formData.get("aboutMotivation")),
    closingHeading: str(formData.get("closingHeading")),
    closingBody: str(formData.get("closingBody")),
    electionDate: str(formData.get("electionDate")),
    contactEmail: str(formData.get("contactEmail")),
    contactNote: str(formData.get("contactNote")),
    featuredUpdateId: str(formData.get("featuredUpdateId")),
    socialLinksJson: str(formData.get("socialLinksJson")) || "[]",
    sectionsJson: JSON.stringify(sections),
    accentColor: str(formData.get("accentColor")),
    accentDeep: str(formData.get("accentDeep")),
    timezone: str(formData.get("timezone")) || DEFAULT_TIMEZONE,
    siteTitle: str(formData.get("siteTitle")),
    siteDescription: str(formData.get("siteDescription")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Check the highlighted fields.",
    };
  }

  const input = parsed.data;
  const payload = {
    candidate_name: input.candidateName,
    campaign_slogan: input.campaignSlogan,
    institution: input.institution,
    position_label: input.positionLabel,
    hero_eyebrow: input.heroEyebrow,
    hero_headline: input.heroHeadline,
    hero_supporting: input.heroSupporting,
    portrait_url: input.portraitUrl,
    portrait_alt: input.portraitAlt,
    monogram: input.monogram,
    logo_url: input.logoUrl,
    logo_alt: input.logoAlt,
    statement_heading: input.statementHeading,
    statement_body: input.statementBody,
    about_heading: input.aboutHeading,
    about_body: input.aboutBody,
    about_philosophy: input.aboutPhilosophy,
    about_involvement: input.aboutInvolvement,
    about_motivation: input.aboutMotivation,
    closing_heading: input.closingHeading,
    closing_body: input.closingBody,
    election_date: input.electionDate,
    contact_email: input.contactEmail,
    contact_note: input.contactNote,
    featured_update_id: input.featuredUpdateId ?? null,
    social_links: preservedSocial ?? parseSocialLinks(input.socialLinksJson),
    sections: preservedSections ?? sections,
    accent_color: input.accentColor,
    accent_deep: input.accentDeep,
    timezone: input.timezone,
    site_title: input.siteTitle,
    site_description: input.siteDescription,
  };

  const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
  if (error) return { ok: false, message: error.message };

  await audit(supabase, actor.id, "settings.updated", "site_settings", "1");
  revalidatePublic();
  return { ok: true, message: "Website settings saved. The public site is updated." };
}

/* --------------------------------------------------------------- feedback */

export async function updateFeedbackAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  const state = str(formData.get("state"));
  if (!id || !["new", "read", "replied", "archived"].includes(state)) return;

  const supabase = await createServerSupabase();
  await supabase.from("feedback_submissions").update({ state }).eq("id", id);
  await audit(supabase, actor.id, `feedback.${state}`, "feedback_submissions", id);
  revalidatePath("/admin/feedback");
}

export async function saveFeedbackNoteAction(formData: FormData): Promise<void> {
  await assertAdminForAction();
  const id = str(formData.get("id"));
  const notes = str(formData.get("adminNotes")).slice(0, 4000);
  if (!id) return;

  const supabase = await createServerSupabase();
  await supabase.from("feedback_submissions").update({ admin_notes: notes }).eq("id", id);
  revalidatePath("/admin/feedback");
}

export async function deleteFeedbackAction(formData: FormData): Promise<void> {
  const actor = await assertAdminForAction();
  const id = str(formData.get("id"));
  if (!id) return;

  const supabase = await createServerSupabase();
  await supabase.from("feedback_submissions").delete().eq("id", id);
  await audit(supabase, actor.id, "feedback.deleted", "feedback_submissions", id);
  revalidatePath("/admin/feedback");
}

/* ------------------------------------------------------------------ misc */

export async function publishScheduledNowAction(): Promise<void> {
  await assertAdminForAction();
  const supabase = await createServerSupabase();
  await supabase.rpc("publish_scheduled_updates");
  revalidatePublic();
  redirect("/admin/updates?published=1");
}

/** Used by the login form to prefill nothing; kept for completeness. */
export async function noopAction(): Promise<void> {}
