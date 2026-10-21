import type { RecordField } from "./admin-fields";
import {
  ALL_INITIATIVE_STATUSES,
  ALL_UPDATE_CATEGORIES,
  CONTENT_STATUS_LABELS,
  EVENT_STATE_LABELS,
  INITIATIVE_STATUS_LABELS,
  UPDATE_CATEGORY_LABELS,
} from "./types";

export const CATEGORY_OPTIONS = ALL_UPDATE_CATEGORIES.map((value) => ({
  value,
  label: UPDATE_CATEGORY_LABELS[value],
}));

export const CONTENT_STATUS_OPTIONS = (["draft", "scheduled", "published", "archived"] as const).map(
  (value) => ({ value, label: CONTENT_STATUS_LABELS[value] }),
);

export const INITIATIVE_OPTIONS = ALL_INITIATIVE_STATUSES.map((value) => ({
  value,
  label: INITIATIVE_STATUS_LABELS[value],
}));

export const EVENT_STATE_OPTIONS = (["scheduled", "cancelled", "postponed"] as const).map(
  (value) => ({ value, label: EVENT_STATE_LABELS[value] }),
);

/* --------------------------------------------------------------- updates */

export function updateFields(
  manifestoOptions: { value: string; label: string }[],
): RecordField[] {
  return [
    { name: "title", label: "Title", type: "text", wide: true, placeholder: "An update worth reading" },
    { name: "slug", label: "URL slug", type: "slug", wide: true },
    {
      name: "summary",
      label: "Summary",
      type: "textarea",
      rows: 3,
      wide: true,
      hint: "One or two sentences. Shown in the feed, on the card and in search results.",
    },
    {
      name: "body",
      label: "Content",
      type: "markdown",
      wide: true,
      rows: 20,
    },
    { name: "category", label: "Category", type: "select", options: CATEGORY_OPTIONS },
    { name: "status", label: "Publication status", type: "select", options: CONTENT_STATUS_OPTIONS, hint: "Drafts and scheduled posts are never publicly visible." },
    {
      name: "publishedAt",
      label: "Publication date",
      type: "datetime",
      hint: "Leave blank to publish immediately. Times are in the campaign timezone.",
    },
    {
      name: "scheduledFor",
      label: "Schedule for",
      type: "datetime",
      hint: "Required when the status is Scheduled. A server-side job publishes it.",
    },
    { name: "coverImageUrl", label: "Cover image", type: "image", wide: true, folder: "updates" },
    {
      name: "coverImageAlt",
      label: "Cover image description",
      type: "text",
      wide: true,
      optional: true,
      hint: "Describe the image for screen readers. Required if you upload an image.",
    },
    { name: "galleryJson", label: "Image gallery", type: "gallery", wide: true },
    {
      name: "relatedManifestoId",
      label: "Related manifesto item",
      type: "select",
      options: [{ value: "", label: "None" }, ...manifestoOptions],
    },
    {
      name: "externalUrl",
      label: "External link",
      type: "url",
      optional: true,
      placeholder: "https://…",
      hint: "Optional. Opens in a new tab with rel=noopener.",
    },
    { name: "externalLabel", label: "External link label", type: "text", optional: true, placeholder: "Register here" },
    {
      name: "isPinned",
      label: "Pin this announcement",
      type: "checkbox",
      wide: true,
      hint: "Pinned updates are prioritised in the feed and can be used as the featured announcement.",
    },
  ];
}

/* ------------------------------------------------------------- manifesto */

export function manifestoFields(): RecordField[] {
  return [
    { name: "title", label: "Title", type: "text", wide: true },
    { name: "slug", label: "URL slug", type: "slug", wide: true },
    { name: "category", label: "Theme", type: "text", hint: "e.g. Student Voice, Transparency, Inclusion" },
    { name: "status", label: "Status", type: "select", options: INITIATIVE_OPTIONS, hint: "Every new proposal should start as Proposed." },
    { name: "issue", label: "1 · The issue or opportunity", type: "textarea", wide: true, rows: 3 },
    { name: "proposal", label: "2 · The proposed initiative", type: "textarea", wide: true, rows: 3 },
    { name: "whyItMatters", label: "3 · Why it matters to students", type: "textarea", wide: true, rows: 3 },
    { name: "outcome", label: "4 · Intended outcome", type: "textarea", wide: true, rows: 3 },
    { name: "firstStep", label: "5 · A realistic first step", type: "textarea", wide: true, rows: 3 },
    { name: "considerations", label: "6 · Implementation considerations", type: "textarea", wide: true, rows: 3 },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999, hint: "Lower numbers appear first." },
    { name: "isVisible", label: "Visible on the public site", type: "checkbox" },
  ];
}

/* ---------------------------------------------------------------- events */

export function eventFields(): RecordField[] {
  return [
    { name: "title", label: "Event title", type: "text", wide: true },
    { name: "slug", label: "URL slug", type: "slug", wide: true },
    { name: "description", label: "Description", type: "textarea", wide: true, rows: 4 },
    {
      name: "startsAt",
      label: "Starts at",
      type: "datetime",
      hint: "Campaign timezone. Past events move to the archive automatically.",
    },
    { name: "endsAt", label: "Ends at", type: "datetime", optional: true },
    { name: "venue", label: "Venue", type: "text", placeholder: "Room, building or online" },
    { name: "state", label: "Event status", type: "select", options: EVENT_STATE_OPTIONS },
    { name: "coverImageUrl", label: "Cover image", type: "image", wide: true, folder: "events" },
    { name: "coverImageAlt", label: "Cover image description", type: "text", wide: true, optional: true },
    { name: "registrationUrl", label: "Registration link", type: "url", optional: true, placeholder: "https://…" },
    { name: "additionalInfo", label: "Additional information", type: "textarea", wide: true, rows: 2, optional: true },
    { name: "recap", label: "Recap (after the event)", type: "textarea", wide: true, rows: 3, optional: true, hint: "Shown with past events." },
    {
      name: "isPublished",
      label: "Publish to the public calendar",
      type: "checkbox",
      wide: true,
      hint: "Only publish once the date, time and venue are confirmed.",
    },
  ];
}

/* -------------------------------------------------------------- progress */

export function progressFields(
  updateOptions: { value: string; label: string }[],
): RecordField[] {
  return [
    { name: "initiativeName", label: "Initiative name", type: "text", wide: true },
    { name: "originalProposal", label: "Original proposal", type: "textarea", wide: true, rows: 3 },
    { name: "status", label: "Current status", type: "select", options: INITIATIVE_OPTIONS },
    {
      name: "percent",
      label: "Progress percentage",
      type: "number",
      min: 0,
      max: 100,
      optional: true,
      hint: "Only use this when there is a meaningful, defensible measurement. Leave blank otherwise.",
    },
    { name: "progressNote", label: "Progress explanation", type: "textarea", wide: true, rows: 3 },
    {
      name: "relatedUpdateId",
      label: "Related announcement",
      type: "select",
      options: [{ value: "", label: "None" }, ...updateOptions],
    },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "isVisible", label: "Visible on the public site", type: "checkbox" },
  ];
}

/* ---------------------------------------------------------------- vision */

export function visionFields(): RecordField[] {
  return [
    { name: "title", label: "Pillar title", type: "text", wide: true },
    { name: "slug", label: "URL slug", type: "slug", wide: true },
    { name: "kicker", label: "Kicker", type: "text", placeholder: "Pillar 01", optional: true },
    { name: "status", label: "Status", type: "select", options: INITIATIVE_OPTIONS },
    { name: "summary", label: "Summary", type: "textarea", wide: true, rows: 3 },
    { name: "studentNeed", label: "Student need being addressed", type: "textarea", wide: true, rows: 2 },
    { name: "approach", label: "Proposed approach", type: "textarea", wide: true, rows: 2 },
    { name: "benefit", label: "Potential benefit", type: "textarea", wide: true, rows: 2 },
    { name: "displayOrder", label: "Display order", type: "number", min: 0, max: 999 },
    { name: "isVisible", label: "Visible on the public site", type: "checkbox" },
  ];
}
