import type { CampaignEvent } from "./types";

/**
 * Split events into upcoming and past using absolute instants.
 *
 * `starts_at`/`ends_at` are stored as `timestamptz`, so the comparison is
 * correct regardless of the visitor's device timezone or the server's locale.
 * An event still in progress counts as upcoming until it ends.
 */
export function splitEvents(events: CampaignEvent[], now = new Date()) {
  const upcoming: CampaignEvent[] = [];
  const past: CampaignEvent[] = [];

  for (const event of events) {
    const starts = new Date(event.starts_at);
    const ends = event.ends_at ? new Date(event.ends_at) : null;
    const reference = ends && ends > starts ? ends : starts;
    if (reference.getTime() >= now.getTime()) upcoming.push(event);
    else past.push(event);
  }

  return {
    upcoming: upcoming.sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    ),
    past: past.sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
    ),
  };
}
