import Link from "next/link";

import UpdateCard from "@/components/site/UpdateCard";
import { ArrowRight, SectionHeader } from "@/components/ui";
import type { SiteSettings, UpdatePost } from "@/lib/types";

export default function Updates({
  featured,
  latest,
  total,
  settings,
}: {
  featured: UpdatePost | null;
  latest: UpdatePost[];
  total: number;
  settings: SiteSettings;
}) {
  return (
    <section id="updates" aria-labelledby="updates-heading" className="bg-paper section-y">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Live campaign updates"
            title={<span id="updates-heading">The Campaign, In Real Time.</span>}
            intro="Announcements, manifesto changes and progress reports, published from the campaign dashboard and dated the moment they go live."
          />
          {total > 0 ? (
            <div data-reveal className="shrink-0 md:pb-2">
              <Link href="/updates" className="btn btn-secondary">
                View all updates
                <ArrowRight />
              </Link>
            </div>
          ) : null}
        </div>

        {featured ? (
          <div className="mt-14">
            <UpdateCard update={featured} timeZone={settings.timezone} featured />
          </div>
        ) : null}

        {latest.length ? (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {latest.map((update) => (
              <UpdateCard
                key={update.id}
                update={update}
                timeZone={settings.timezone}
              />
            ))}
          </div>
        ) : null}

        {!featured && !latest.length ? (
          <div
            data-reveal
            className="mt-14 border border-dashed border-line-strong/80 bg-ivory px-8 py-14 text-center"
          >
            <p className="font-serif text-2xl text-plum">No updates published yet</p>
            <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-relaxed text-muted">
              Campaign announcements will appear here as soon as they are published.
              There is nothing to show at the moment.
            </p>
            <Link href="/#voice" className="btn btn-secondary mt-7">
              Share an idea in the meantime
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
