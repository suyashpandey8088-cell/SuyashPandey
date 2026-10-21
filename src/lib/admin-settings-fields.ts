import type { RecordField } from "./admin-fields";
import type { SiteSettings } from "./types";

/**
 * The settings form is split across two screens (Candidate profile and Website
 * settings). Both submit to the same validated action, so each screen passes
 * the other screen's values through as hidden inputs — that way saving one
 * never clears the other.
 */

const VALUE_MAP = {
  candidateName: (s: SiteSettings) => s.candidate_name,
  campaignSlogan: (s: SiteSettings) => s.campaign_slogan,
  institution: (s: SiteSettings) => s.institution,
  positionLabel: (s: SiteSettings) => s.position_label,
  heroEyebrow: (s: SiteSettings) => s.hero_eyebrow,
  heroHeadline: (s: SiteSettings) => s.hero_headline,
  heroSupporting: (s: SiteSettings) => s.hero_supporting,
  portraitUrl: (s: SiteSettings) => s.portrait_url,
  portraitAlt: (s: SiteSettings) => s.portrait_alt,
  monogram: (s: SiteSettings) => s.monogram,
  logoUrl: (s: SiteSettings) => s.logo_url,
  logoAlt: (s: SiteSettings) => s.logo_alt,
  statementHeading: (s: SiteSettings) => s.statement_heading,
  statementBody: (s: SiteSettings) => s.statement_body,
  aboutHeading: (s: SiteSettings) => s.about_heading,
  aboutBody: (s: SiteSettings) => s.about_body,
  aboutPhilosophy: (s: SiteSettings) => s.about_philosophy,
  aboutInvolvement: (s: SiteSettings) => s.about_involvement,
  aboutMotivation: (s: SiteSettings) => s.about_motivation,
  closingHeading: (s: SiteSettings) => s.closing_heading,
  closingBody: (s: SiteSettings) => s.closing_body,
  electionDate: (s: SiteSettings) => s.election_date,
  contactEmail: (s: SiteSettings) => s.contact_email,
  contactNote: (s: SiteSettings) => s.contact_note,
  featuredUpdateId: (s: SiteSettings) => s.featured_update_id,
  socialLinksJson: (s: SiteSettings) => JSON.stringify(s.social_links ?? []),
  accentColor: (s: SiteSettings) => s.accent_color,
  accentDeep: (s: SiteSettings) => s.accent_deep,
  timezone: (s: SiteSettings) => s.timezone,
  siteTitle: (s: SiteSettings) => s.site_title,
  siteDescription: (s: SiteSettings) => s.site_description,
} as const;

export type SettingsFieldName = keyof typeof VALUE_MAP;

export function settingsValues(settings: SiteSettings): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const [key, getter] of Object.entries(VALUE_MAP)) {
    values[key] = getter(settings) ?? "";
  }
  values.sections = settings.sections;
  return values;
}

/** Pass-through values for everything the current screen does not render. */
export function hiddenSettings(
  settings: SiteSettings,
  rendered: SettingsFieldName[],
): Record<string, string> {
  const hidden: Record<string, string> = {};
  for (const [key, getter] of Object.entries(VALUE_MAP)) {
    if (rendered.includes(key as SettingsFieldName)) continue;
    const value = getter(settings);
    if (value !== null && value !== undefined && String(value).length > 0) {
      hidden[key] = String(value);
    }
  }
  return hidden;
}

/* ------------------------------------------------------- candidate profile */

export const PROFILE_FIELD_NAMES: SettingsFieldName[] = [
  "candidateName",
  "positionLabel",
  "institution",
  "campaignSlogan",
  "monogram",
  "portraitUrl",
  "portraitAlt",
  "aboutHeading",
  "aboutBody",
  "aboutPhilosophy",
  "aboutInvolvement",
  "aboutMotivation",
];

export function profileFields(): RecordField[] {
  return [
    { name: "candidateName", label: "Candidate name", type: "text" },
    { name: "positionLabel", label: "Position", type: "text" },
    { name: "institution", label: "Institution", type: "text" },
    { name: "campaignSlogan", label: "Campaign slogan", type: "text" },
    {
      name: "monogram",
      label: "Monogram",
      type: "text",
      hint: "Two letters, used in the wordmark and placeholder portrait.",
    },
    {
      name: "portraitUrl",
      label: "Campaign portrait",
      type: "image",
      wide: true,
      folder: "portraits",
      hint: "Until a portrait is uploaded, the site shows a designed placeholder — never a stand-in photograph.",
    },
    {
      name: "portraitAlt",
      label: "Portrait description",
      type: "text",
      wide: true,
      hint: "Describe the photograph for screen readers.",
    },
    { name: "aboutHeading", label: "About heading", type: "text", wide: true },
    {
      name: "aboutBody",
      label: "Biography",
      type: "textarea",
      wide: true,
      rows: 8,
      hint: "Leave a blank line between paragraphs. Only state things that are true — this is the candidate's own record.",
    },
    {
      name: "aboutPhilosophy",
      label: "Leadership philosophy",
      type: "textarea",
      wide: true,
      rows: 3,
      hint: "Shown as a pull quote in the About section.",
    },
    {
      name: "aboutInvolvement",
      label: "College involvement",
      type: "textarea",
      wide: true,
      rows: 3,
      optional: true,
      hint: "Only what can be stated accurately. Hidden automatically if left empty.",
    },
    {
      name: "aboutMotivation",
      label: "Why I am standing",
      type: "textarea",
      wide: true,
      rows: 3,
    },
  ];
}

/* -------------------------------------------------------- website settings */

export const SETTINGS_FIELD_NAMES: SettingsFieldName[] = [
  "siteTitle",
  "siteDescription",
  "heroEyebrow",
  "heroHeadline",
  "heroSupporting",
  "statementHeading",
  "statementBody",
  "closingHeading",
  "closingBody",
  "logoUrl",
  "logoAlt",
  "socialLinksJson",
  "contactEmail",
  "contactNote",
  "electionDate",
  "featuredUpdateId",
  "accentColor",
  "accentDeep",
  "timezone",
];

export function settingsFields(
  updateOptions: { value: string; label: string }[],
): RecordField[] {
  return [
    { name: "siteTitle", label: "Browser / SEO title", type: "text", wide: true },
    {
      name: "siteDescription",
      label: "Meta description",
      type: "textarea",
      wide: true,
      rows: 2,
      hint: "Around 150–160 characters works best in search results and link previews.",
    },
    { name: "heroEyebrow", label: "Hero eyebrow", type: "text", wide: true },
    {
      name: "heroHeadline",
      label: "Hero headline",
      type: "text",
      wide: true,
      hint: "Split into lines on sentence boundaries. The final line is set in the accent colour.",
    },
    { name: "heroSupporting", label: "Hero supporting text", type: "textarea", wide: true, rows: 2 },
    { name: "statementHeading", label: "Statement heading", type: "text", wide: true },
    { name: "statementBody", label: "Statement body", type: "textarea", wide: true, rows: 3 },
    { name: "closingHeading", label: "Closing heading", type: "text", wide: true },
    { name: "closingBody", label: "Closing body", type: "textarea", wide: true, rows: 2 },
    { name: "logoUrl", label: "Logo", type: "image", wide: true, folder: "brand" },
    { name: "logoAlt", label: "Logo description", type: "text", wide: true, optional: true },
    { name: "socialLinksJson", label: "Social links", type: "social", wide: true },
    { name: "contactEmail", label: "Contact email", type: "email", optional: true },
    {
      name: "contactNote",
      label: "Contact note",
      type: "text",
      optional: true,
      hint: "Shown under the contact links in the footer.",
    },
    {
      name: "electionDate",
      label: "Election date",
      type: "date",
      optional: true,
      hint: "Displayed in the closing section. Leave blank to omit it entirely.",
    },
    {
      name: "featuredUpdateId",
      label: "Featured announcement",
      type: "select",
      options: [{ value: "", label: "Use the pinned or newest update" }, ...updateOptions],
      hint: "The announcement highlighted at the top of the Live updates section.",
    },
    {
      name: "accentColor",
      label: "Accent colour",
      type: "text",
      hint: "Six-digit hex. The established identity is #76639A.",
    },
    {
      name: "accentDeep",
      label: "Deep accent colour",
      type: "text",
      hint: "Used for depth. The established identity is #443451.",
    },
    {
      name: "timezone",
      label: "Editorial timezone",
      type: "text",
      hint: "IANA name, e.g. Asia/Kolkata. Controls how all public dates are shown.",
    },
    { name: "sections", label: "Homepage sections", type: "sections", wide: true },
  ];
}
