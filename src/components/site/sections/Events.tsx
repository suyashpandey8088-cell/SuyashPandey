import Link from "next/link";

import EventCard from "@/components/site/EventCard";
import { ArrowRight, SectionHeader } from "@/components/ui";
import type { CampaignEvent, SiteSettings } from "@/lib/types";

export default function Events({
  upcoming,
  past,
  settings,
}: {
  upcoming: CampaignEvent[];
  past: CampaignEvent[];
  settings: SiteSettings;
}) {
  const hasAny = upcoming.length > 0 || past.length > 0;

  return (
    <section id="events" aria-labelledby="events-heading" className="bg-ivory section-y">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Events & calendar"
            title={<span id="events-heading">Let&rsquo;s Bring Ideas to Life.</span>}
            intro="Listening sessions, campus conversations and campaign events. Only confirmed details are published here, and changes are dated."
          />
          {hasAny ? (
            <div data-reveal className="shrink-0 md:pb-2">
              <Link href="/events" className="btn btn-secondary">
                Full calendar
                <ArrowRight />
              </Link>
            </div>
          ) : null}
        </div>

        {upcoming.length ? (
          <div className="mt-12 border-t border-line">
            <p data-reveal className="eyebrow mt-8 mb-2 text-[0.6rem]">
              Upcoming
            </p>
            {upcoming.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} timeZone={settings.timezone} />
            ))}
          </div>
        ) : (
          <div
            data-reveal
            className="mt-12 grid gap-6 border border-dashed border-line-strong/80 bg-paper px-8 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-12"
          >
            <div>
              <p className="font-serif text-[1.7rem] leading-snug text-plum">
                No events confirmed yet.
              </p>
              <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-muted">
                Campaign events will be published here once the date, time and venue
                are confirmed. Nothing is listed in advance of confirmation — an empty
                calendar is more honest than a speculative one.
              </p>
            </div>
            <Link href="/#voice" className="btn btn-secondary justify-self-start md:justify-self-end">
              Suggest a session
            </Link>
          </div>
        )}

        {past.length ? (
          <div className="mt-14 border-t border-line pt-2">
            <p data-reveal className="eyebrow mt-8 mb-2 text-[0.6rem]">
              Previously held
            </p>
            {past.slice(0, 2).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                timeZone={settings.timezone}
                past
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
