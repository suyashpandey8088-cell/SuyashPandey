import Link from "next/link";

import { EditorialLink, SectionHeader, StatusTag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { ProgressItem, SiteSettings, UpdatePost } from "@/lib/types";

export default function Progress({
  items,
  updates,
  settings,
}: {
  items: ProgressItem[];
  updates: UpdatePost[];
  settings: SiteSettings;
}) {
  if (!items.length) return null;

  const updateById = new Map(updates.map((update) => [update.id, update]));

  return (
    <section
      id="progress"
      aria-labelledby="progress-heading"
      className="bg-paper section-y"
    >
      <div className="shell">
        <SectionHeader
          eyebrow="Progress & accountability"
          title={<span id="progress-heading">Promises Need Progress.</span>}
          intro="The current state of every proposal. A status is only changed when something real has changed, and every entry carries the date it was last reviewed."
        />

        <div className="mt-14">
          {items.map((item) => {
            const related = item.related_update_id
              ? updateById.get(item.related_update_id)
              : undefined;

            return (
              <div
                key={item.id}
                data-reveal
                className="grid gap-4 border-t border-line py-8 md:grid-cols-[1.1fr_1fr_auto] md:gap-10"
              >
                <div>
                  <h3 className="font-serif text-[1.4rem] leading-tight text-plum">
                    {item.initiative_name}
                  </h3>
                  {item.original_proposal ? (
                    <p className="mt-2.5 max-w-[46ch] text-[0.86rem] leading-relaxed text-muted">
                      <span className="text-[0.6rem] uppercase tracking-[0.16em] text-purple/80">
                        As proposed ·{" "}
                      </span>
                      {item.original_proposal}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="max-w-[52ch] text-[0.92rem] leading-[1.7] text-charcoal/80">
                    {item.progress_note}
                  </p>

                  {typeof item.percent === "number" ? (
                    <div className="mt-4 max-w-[16rem]">
                      <div
                        className="h-[3px] w-full overflow-hidden bg-line"
                        role="progressbar"
                        aria-valuenow={item.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.initiative_name} progress`}
                      >
                        <div
                          className="h-full bg-purple/80"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-muted">
                        {item.percent}% of first-step scope complete
                      </p>
                    </div>
                  ) : null}

                  {related ? (
                    <Link
                      href={`/updates/${related.slug}`}
                      className="mt-3 inline-flex text-[0.62rem] uppercase tracking-[0.16em] text-purple underline decoration-champagne underline-offset-4 transition-colors hover:text-plum"
                    >
                      Related announcement
                    </Link>
                  ) : null}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <StatusTag status={item.status} />
                  <span className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">
                    Updated {formatDate(item.updated_at, settings.timezone)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div data-reveal className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="max-w-[60ch] text-xs leading-relaxed text-muted">
            A student council candidate cannot authorise institutional change. Where a
            proposal depends on a college decision, the board says so — and
            &ldquo;Awaiting Approval&rdquo; is used only when a request has actually been
            made.
          </p>
          <EditorialLink href="/updates">Follow progress in the updates</EditorialLink>
        </div>
      </div>
    </section>
  );
}
