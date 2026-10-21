/**
 * Shared domain types. These mirror the Postgres schema in
 * supabase/migrations/0001_init.sql and are the single source of truth for
 * both the public site and the admin dashboard.
 */

export type ContentStatus = "draft" | "scheduled" | "published" | "archived";

export type InitiativeStatus =
  | "proposed"
  | "in_progress"
  | "awaiting_approval"
  | "completed"
  | "on_hold";

export type UpdateCategory =
  | "announcements"
  | "campaign_news"
  | "events"
  | "manifesto_updates"
  | "progress_reports";

export type EventState = "scheduled" | "cancelled" | "postponed";

export type FeedbackState = "new" | "read" | "replied" | "archived";

export type FeedbackCategory =
  | "idea"
  | "question"
  | "concern"
  | "event"
  | "accessibility"
  | "other";

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  id: number;
  candidate_name: string;
  campaign_slogan: string;
  institution: string;
  position_label: string;
  hero_eyebrow: string;
  hero_headline: string;
  hero_supporting: string;
  portrait_url: string | null;
  portrait_alt: string;
  monogram: string;
  logo_url: string | null;
  logo_alt: string;
  statement_heading: string;
  statement_body: string;
  about_heading: string;
  about_body: string;
  about_philosophy: string;
  about_involvement: string;
  about_motivation: string;
  closing_heading: string;
  closing_body: string;
  election_date: string | null;
  social_links: SocialLink[];
  contact_email: string | null;
  contact_note: string | null;
  featured_update_id: string | null;
  sections: Record<string, boolean>;
  accent_color: string;
  accent_deep: string;
  timezone: string;
  site_title: string;
  site_description: string;
  og_image_url: string | null;
  updated_at: string;
}

export interface ManifestoItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  issue: string;
  proposal: string;
  why_it_matters: string;
  outcome: string;
  first_step: string;
  considerations: string;
  status: InitiativeStatus;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisionPillar {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  student_need: string;
  approach: string;
  benefit: string;
  status: InitiativeStatus;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: UpdateCategory;
  status: ContentStatus;
  published_at: string | null;
  scheduled_for: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  gallery: GalleryImage[];
  related_manifesto_id: string | null;
  external_url: string | null;
  external_label: string | null;
  is_pinned: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  venue: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  registration_url: string | null;
  additional_info: string | null;
  recap: string | null;
  gallery: GalleryImage[];
  state: EventState;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressItem {
  id: string;
  initiative_name: string;
  original_proposal: string;
  status: InitiativeStatus;
  progress_note: string;
  percent: number | null;
  related_update_id: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackSubmission {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  category: FeedbackCategory;
  message: string;
  consent: boolean;
  state: FeedbackState;
  admin_notes: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

/* ------------------------------------------------------------------ labels */

export const UPDATE_CATEGORY_LABELS: Record<UpdateCategory, string> = {
  announcements: "Announcements",
  campaign_news: "Campaign News",
  events: "Events",
  manifesto_updates: "Manifesto Updates",
  progress_reports: "Progress Reports",
};

export const INITIATIVE_STATUS_LABELS: Record<InitiativeStatus, string> = {
  proposed: "Proposed",
  in_progress: "In Progress",
  awaiting_approval: "Awaiting Approval",
  completed: "Completed",
  on_hold: "On Hold",
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export const EVENT_STATE_LABELS: Record<EventState, string> = {
  scheduled: "Confirmed",
  cancelled: "Cancelled",
  postponed: "Postponed",
};

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  idea: "An idea",
  question: "A question",
  concern: "A concern",
  event: "An event",
  accessibility: "Accessibility",
  other: "Something else",
};

export const FEEDBACK_STATE_LABELS: Record<FeedbackState, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

export const ALL_UPDATE_CATEGORIES = Object.keys(
  UPDATE_CATEGORY_LABELS,
) as UpdateCategory[];

export const ALL_INITIATIVE_STATUSES = Object.keys(
  INITIATIVE_STATUS_LABELS,
) as InitiativeStatus[];

export const ALL_FEEDBACK_CATEGORIES = Object.keys(
  FEEDBACK_CATEGORY_LABELS,
) as FeedbackCategory[];
