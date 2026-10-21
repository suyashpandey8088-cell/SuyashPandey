/**
 * Small, dependency-free formatting helpers.
 *
 * Every date is stored in Postgres as `timestamptz` (an absolute instant) and
 * rendered in the editorial timezone configured in site settings, so a visitor
 * in any timezone sees the campaign's own local time.
 */

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

function safeDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function zoneOptions(timeZone?: string): Intl.DateTimeFormatOptions {
  const zone = timeZone || DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: zone });
    return { timeZone: zone };
  } catch {
    return { timeZone: DEFAULT_TIMEZONE };
  }
}

export function formatDate(
  value: string | Date | null | undefined,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = safeDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...zoneOptions(timeZone),
    ...options,
  }).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  timeZone?: string,
): string {
  const date = safeDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...zoneOptions(timeZone),
  }).format(date);
}

export function formatTime(
  value: string | Date | null | undefined,
  timeZone?: string,
): string {
  const date = safeDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...zoneOptions(timeZone),
  }).format(date);
}

/** "Mon" / "12" parts for the editorial event date block. */
export function dateParts(
  value: string | Date | null | undefined,
  timeZone?: string,
): { day: string; month: string; weekday: string; year: string } {
  const date = safeDate(value);
  if (!date) return { day: "", month: "", weekday: "", year: "" };
  const opts = zoneOptions(timeZone);
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit", ...opts }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short", ...opts }).format(date),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "short", ...opts }).format(date),
    year: new Intl.DateTimeFormat("en-GB", { year: "numeric", ...opts }).format(date),
  };
}

export function relativeToNow(value: string | Date | null | undefined): string {
  const date = safeDate(value);
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return mins > 0 ? `${mins}m ago` : `in ${-mins}m`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return hours > 0 ? `${hours}h ago` : `in ${-hours}h`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return days > 0 ? `${days}d ago` : `in ${-days}d`;
  return formatDate(date);
}

export function readingTime(markdown: string | null | undefined): number {
  const words = (markdown || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function excerpt(text: string | null | undefined, max = 160): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/[,.;:\s]+\S*$/, "")}…`;
}

/**
 * Split a headline into optically balanced lines so the serif display type can
 * animate line-by-line. Punctuation-heavy campaign lines like
 * "Your Voice. Our Campus. Our Future." are split on the sentence boundary.
 */
export function splitHeadline(headline: string): string[] {
  const clean = (headline || "").trim();
  if (!clean) return [];
  if (clean.includes("\n")) {
    return clean
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (sentences.length > 1 && sentences.length <= 4) return sentences;
  return [clean];
}

/** Only allow http(s) links out of the site. */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

export function initials(name: string, fallback = "SP"): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
