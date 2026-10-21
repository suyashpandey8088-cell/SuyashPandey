import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/site/PageHeader";
import UpdateCard from "@/components/site/UpdateCard";
import { cx } from "@/lib/cx";
import { getSettings, getUpdates } from "@/lib/data";
import { ALL_UPDATE_CATEGORIES, UPDATE_CATEGORY_LABELS } from "@/lib/types";
import type { UpdateCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campaign updates",
  description:
    "Announcements, manifesto updates, event notices and progress reports from the Suyash Pandey student council campaign — newest first.",
  alternates: { canonical: "/updates" },
};

const PAGE_SIZE = 6;
const MAX_SHOW = 60;

function parseCategory(value: string | string[] | undefined): UpdateCategory | "all" {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ALL_UPDATE_CATEGORIES.includes(candidate as UpdateCategory)
    ? (candidate as UpdateCategory)
    : "all";
}

function buildHref(category: UpdateCategory | "all", show: number) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (show > PAGE_SIZE) params.set("show", String(show));
  const query = params.toString();
  return query ? `/updates?${query}` : "/updates";
}

export default async function UpdatesIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const requested = Number(Array.isArray(params.show) ? params.show[0] : params.show);
  const show = Number.isFinite(requested)
    ? Math.min(MAX_SHOW, Math.max(PAGE_SIZE, requested))
    : PAGE_SIZE;

  const [settings, result] = await Promise.all([
    getSettings(),
    getUpdates({ limit: show, category }),
  ]);

  const { items, total, hasMore } = result;

  return (
    <>
      <PageHeader
        eyebrow="Campaign bulletin"
        title="The Campaign, In Real Time."
        intro="Every announcement, manifesto change and progress report, published the moment it is ready and dated when it goes live. Newest first."
        meta={
          <>
            <span>{total} published {total === 1 ? "update" : "updates"}</span>
            <span aria-hidden="true" className="text-champagne">·</span>
            <span>Archive</span>
          </>
        }
      />

      <section className="bg-paper section-y">
        <div className="shell">
          {/* Category filters — real links so they work without JavaScript */}
          <nav aria-label="Filter updates by category" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildHref("all", PAGE_SIZE)}
              aria-current={category === "all" ? "page" : undefined}
              className={cx(
                "shrink-0 border px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] transition-colors",
                category === "all"
                  ? "border-plum bg-plum text-white"
                  : "border-line text-plum hover:border-purple/40 hover:bg-lavender-50",
              )}
            >
              All
            </Link>
            {ALL_UPDATE_CATEGORIES.map((value) => (
              <Link
                key={value}
                href={buildHref(value, PAGE_SIZE)}
                aria-current={category === value ? "page" : undefined}
                className={cx(
                  "shrink-0 border px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] transition-colors",
                  category === value
                    ? "border-plum bg-plum text-white"
                    : "border-line text-plum hover:border-purple/40 hover:bg-lavender-50",
                )}
              >
                {UPDATE_CATEGORY_LABELS[value]}
              </Link>
            ))}
          </nav>

          {items.length ? (
            <div className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-2 lg:grid-cols-3">
              {items.map((update) => (
                <UpdateCard key={update.id} update={update} timeZone={settings.timezone} />
              ))}
            </div>
          ) : (
            <div className="mt-12 border border-dashed border-line-strong bg-ivory px-8 py-16 text-center">
              <p className="font-serif text-2xl text-plum">
                Nothing published in this category yet
              </p>
              <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-muted">
                Updates appear here as soon as they are published. Try another category,
                or read everything.
              </p>
              <Link href="/updates" className="btn btn-secondary mt-7">
                View all updates
              </Link>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-muted">
              Showing {items.length} of {total}
            </p>
            {hasMore ? (
              <Link
                href={buildHref(category, show + PAGE_SIZE)}
                className="btn btn-secondary"
                rel="next"
              >
                Load earlier updates
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
