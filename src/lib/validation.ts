import { z } from "zod";

/**
 * Every mutation and every public form submission is parsed here, on the
 * server, before it touches the database. The database constraints in
 * 0001_init.sql are the second line of defence.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length ? value : null));

const nullableUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length ? value : null))
  .refine(
    (value) => value === null || /^https?:\/\/[^\s]+$/i.test(value),
    "Enter a full URL starting with https://",
  );

const slugField = z
  .string()
  .trim()
  .min(2, "A slug is required")
  .max(90)
  .regex(SLUG_RE, "Use lowercase letters, numbers and hyphens only");

/* --------------------------------------------------------------- feedback */

export const feedbackSchema = z.object({
  name: z.string().trim().max(80, "Please keep your name under 80 characters").optional(),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
      "Enter a valid email address",
    ),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .refine(
      (value) => !value || /^[+0-9\s()-]{6,}$/.test(value),
      "Enter a valid phone number",
    ),
  category: z.enum(["idea", "question", "concern", "event", "accessibility", "other"]),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters so the message is useful")
    .max(5000, "Please keep your message under 5000 characters"),
  consent: z.coerce.boolean().default(false),
  // Anti-spam: a hidden field only a bot would fill in.
  website: z.string().max(0, "Rejected").optional().default(""),
  // Anti-spam: submissions faster than this are automated.
  elapsedMs: z.coerce.number().int().min(0).default(0),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/* ------------------------------------------------------------------ login */

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(200)
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "The two passwords do not match",
    path: ["confirm"],
  });

/* ------------------------------------------------------------ updates CMS */

export const updateFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(3, "A title is required").max(160),
    slug: slugField,
    summary: z.string().trim().max(400).default(""),
    body: z.string().trim().max(40000).default(""),
    category: z.enum([
      "announcements",
      "campaign_news",
      "events",
      "manifesto_updates",
      "progress_reports",
    ]),
    status: z.enum(["draft", "scheduled", "published", "archived"]),
    publishedAt: z.string().trim().optional(),
    scheduledFor: z.string().trim().optional(),
    coverImageUrl: nullableUrl,
    coverImageAlt: z.string().trim().max(200).optional().default(""),
    galleryJson: z.string().optional().default("[]"),
    relatedManifestoId: z
      .string()
      .uuid()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    externalUrl: nullableUrl,
    externalLabel: z.string().trim().max(80).optional().default(""),
    isPinned: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.status === "scheduled" && !data.scheduledFor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledFor"],
        message: "Choose the date and time this update should publish",
      });
    }
    if (data.status === "published" && !data.publishedAt) {
      // Published posts without a timestamp would be invisible to the public
      // policy, so we always write one. This is enforced again server-side.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishedAt"],
        message: "A publication date is required",
      });
    }
  });

export type UpdateFormInput = z.infer<typeof updateFormSchema>;

/* --------------------------------------------------------- manifesto CMS */

export const manifestoFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "A title is required").max(140),
  slug: slugField,
  category: z.string().trim().min(2).max(60),
  issue: z.string().trim().max(2000).default(""),
  proposal: z.string().trim().max(2000).default(""),
  whyItMatters: z.string().trim().max(2000).default(""),
  outcome: z.string().trim().max(2000).default(""),
  firstStep: z.string().trim().max(2000).default(""),
  considerations: z.string().trim().max(3000).default(""),
  status: z.enum(["proposed", "in_progress", "awaiting_approval", "completed", "on_hold"]),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.coerce.boolean().default(true),
});

export type ManifestoFormInput = z.infer<typeof manifestoFormSchema>;

/* ------------------------------------------------------------ events CMS */

export const eventFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "A title is required").max(160),
  slug: slugField,
  description: z.string().trim().max(5000).default(""),
  startsAt: z.string().trim().min(1, "A start date and time is required"),
  endsAt: z.string().trim().optional(),
  venue: z.string().trim().max(180).default(""),
  coverImageUrl: nullableUrl,
  coverImageAlt: z.string().trim().max(200).optional().default(""),
  registrationUrl: nullableUrl,
  additionalInfo: z.string().trim().max(2000).optional(),
  recap: z.string().trim().max(3000).optional(),
  state: z.enum(["scheduled", "cancelled", "postponed"]),
  isPublished: z.coerce.boolean().default(false),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;

/* ---------------------------------------------------------- progress CMS */

export const progressFormSchema = z.object({
  id: z.string().uuid().optional(),
  initiativeName: z.string().trim().min(3, "An initiative name is required").max(140),
  originalProposal: z.string().trim().max(2000).default(""),
  status: z.enum(["proposed", "in_progress", "awaiting_approval", "completed", "on_hold"]),
  progressNote: z.string().trim().max(2000).default(""),
  percent: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100)])
    .transform((value) => (value === "" ? null : value)),
  relatedUpdateId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.coerce.boolean().default(true),
});

export type ProgressFormInput = z.infer<typeof progressFormSchema>;

/* ----------------------------------------------------------- vision CMS */

export const visionFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "A title is required").max(140),
  slug: slugField,
  kicker: z.string().trim().max(60).default(""),
  summary: z.string().trim().max(1000).default(""),
  studentNeed: z.string().trim().max(1000).default(""),
  approach: z.string().trim().max(1000).default(""),
  benefit: z.string().trim().max(1000).default(""),
  status: z.enum(["proposed", "in_progress", "awaiting_approval", "completed", "on_hold"]),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.coerce.boolean().default(true),
});

export type VisionFormInput = z.infer<typeof visionFormSchema>;

/* ----------------------------------------------------------- settings CMS */

export const settingsFormSchema = z.object({
  candidateName: z.string().trim().min(2).max(80),
  campaignSlogan: z.string().trim().min(2).max(200),
  institution: z.string().trim().min(1).max(80),
  positionLabel: z.string().trim().min(2).max(120),
  heroEyebrow: z.string().trim().max(120).default(""),
  heroHeadline: z.string().trim().min(2).max(200),
  heroSupporting: z.string().trim().max(600).default(""),
  portraitUrl: nullableUrl,
  portraitAlt: z.string().trim().max(200).default(""),
  monogram: z.string().trim().max(4).default("SP"),
  logoUrl: nullableUrl,
  logoAlt: z.string().trim().max(200).default(""),
  statementHeading: z.string().trim().max(160).default(""),
  statementBody: z.string().trim().max(1500).default(""),
  aboutHeading: z.string().trim().max(160).default(""),
  aboutBody: z.string().trim().max(4000).default(""),
  aboutPhilosophy: z.string().trim().max(600).default(""),
  aboutInvolvement: z.string().trim().max(2000).default(""),
  aboutMotivation: z.string().trim().max(1000).default(""),
  closingHeading: z.string().trim().max(160).default(""),
  closingBody: z.string().trim().max(800).default(""),
  electionDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length ? value : null)),
  contactEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length ? value : null))
    .refine(
      (value) => value === null || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
      "Enter a valid email address",
    ),
  contactNote: z.string().trim().max(300).optional().transform((v) => (v && v.length ? v : null)),
  featuredUpdateId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  socialLinksJson: z.string().optional().default("[]"),
  sectionsJson: z.string().optional().default("{}"),
  accentColor: z.string().regex(HEX_RE, "Use a six-digit hex colour"),
  accentDeep: z.string().regex(HEX_RE, "Use a six-digit hex colour"),
  timezone: z.string().trim().min(3).max(60),
  siteTitle: z.string().trim().min(3).max(160),
  siteDescription: z.string().trim().max(400).default(""),
});

export type SettingsFormInput = z.infer<typeof settingsFormSchema>;

/* -------------------------------------------------------------- utilities */

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the highlighted fields";
}

/** Zod errors flattened into `{ field: message }` for inline display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function parseSocialLinks(json: string): { label: string; url: string }[] {
  try {
    const parsed = JSON.parse(json || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.url === "string")
      .map((item) => ({
        label: String(item.label || "Link").slice(0, 40),
        url: String(item.url).slice(0, 400),
      }))
      .filter((item) => /^https?:\/\//i.test(item.url))
      .slice(0, 8);
  } catch {
    return [];
  }
}

export function parseGallery(json: string): { url: string; alt: string }[] {
  try {
    const parsed = JSON.parse(json || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.url === "string" && /^https?:\/\//i.test(item.url))
      .map((item) => ({ url: String(item.url), alt: String(item.alt || "").slice(0, 200) }))
      .slice(0, 12);
  } catch {
    return [];
  }
}
