/**
 * Timezone helpers for the editorial side of the site.
 *
 * The administrator works in the campaign's local timezone (Asia/Kolkata by
 * default) while the database stores absolute instants. These two functions
 * convert between the two without pulling in a date library, and correctly
 * handle the browser-side `datetime-local` format.
 */

const DEFAULT_TZ = "Asia/Kolkata";

function offsetMs(utcMs: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(utcMs));
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - utcMs;
}

/** Convert a `datetime-local` value in the campaign timezone to an ISO instant. */
export function zonedInputToUtc(
  local: string | null | undefined,
  timeZone = DEFAULT_TZ,
): string | null {
  if (!local) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(local);
  if (!match) {
    const parsed = new Date(local);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  const [, y, mo, d, h = "00", mi = "00"] = match;
  const naive = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));

  // Two passes settles DST boundaries in either direction.
  let instant = naive - offsetMs(naive, timeZone);
  instant = naive - offsetMs(instant, timeZone);
  return new Date(instant).toISOString();
}

/** Convert an ISO instant to a `datetime-local` value in the campaign timezone. */
export function utcToZonedInput(
  iso: string | null | undefined,
  timeZone = DEFAULT_TZ,
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day}T${String(Number(map.hour) % 24).padStart(2, "0")}:${map.minute}`;
}

/** ISO instant for "right now" — used for publish-now actions. */
export function nowIso(): string {
  return new Date().toISOString();
}
