import type { Metadata } from "next";
import Link from "next/link";

import EventCard from "@/components/site/EventCard";
import PageHeader from "@/components/site/PageHeader";
import { ArrowRight } from "@/components/ui";
import { getEvents, getSettings, splitEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events & campaign calendar",
  description:
    "Confirmed campaign events, listening sessions and campus conversations. Only details that have been confirmed are listed.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const [settings, events] = await Promise.all([getSettings(), getEvents()]);
  const { upcoming, past } = splitEvents(events);

  return (
    <>
      <PageHeader
        eyebrow="Events & calendar"
        title="Let's Bring Ideas to Life."
        intro="Listening sessions, campus conversations and campaign events. Everything listed here has a confirmed date, time and venue — nothing is announced before it is real."
        meta={
          <>
            <span>{upcoming.length} upcoming</span>
            <span aria-hidden="true" className="text-champagne">·</span>
            <span>{past.length} held</span>
            <span aria-hidden="true" className="text-champagne">·</span>
            <span>Times shown in {settings.timezone.replace("_", " ")}</span>
          </>
        }
      />

      <section className="bg-paper section-y">
        <div className="shell">
          <h2 className="display-serif text-display-sm text-plum">Upcoming</h2>

          {upcoming.length ? (
            <div className="mt-8 border-t border-line">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} timeZone={settings.timezone} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-6 border border-dashed border-line-strong bg-ivory px-8 py-14 md:grid-cols-[1fr_auto] md:items-center md:px-12">
              <div>
                <p className="font-serif text-[1.7rem] leading-snug text-plum">
                  No events confirmed yet.
                </p>
                <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted">
                  When a date, time and venue are confirmed, the event appears here with
                  its full details and any registration link. An empty calendar is more
                  honest than a speculative one.
                </p>
              </div>
              <Link href="/#voice" className="btn btn-secondary justify-self-start md:justify-self-end">
                Suggest a session
                <ArrowRight />
              </Link>
            </div>
          )}

          {past.length ? (
            <>
              <h2 className="display-serif mt-20 text-display-sm text-plum">
                Previously held
              </h2>
              <div className="mt-8 border-t border-line">
                {past.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    timeZone={settings.timezone}
                    past
                  />
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-16 border-t border-line pt-8">
            <p className="max-w-[70ch] text-xs leading-relaxed text-muted">
              Events listed here are organised by the campaign. They are not official{" "}
              {settings.institution} events unless explicitly stated, and any
              institutional venue or permission arrangements remain subject to{" "}
              {settings.institution}&rsquo;s processes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
