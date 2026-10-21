import type { Metadata } from "next";
import Link from "next/link";

import ManifestoEntry from "@/components/site/ManifestoEntry";
import PageHeader from "@/components/site/PageHeader";
import { ArrowRight } from "@/components/ui";
import { cx } from "@/lib/cx";
import { getManifestoItems, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The manifesto",
  description:
    "Six proposals for the NIAT Student Council — each with the issue it responds to, the intended outcome, a realistic first step and the considerations that could hold it back.",
  alternates: { canonical: "/manifesto" },
};

function buildHref(category: string) {
  return category === "all"
    ? "/manifesto"
    : `/manifesto?category=${encodeURIComponent(category)}`;
}

export default async function ManifestoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requested = Array.isArray(params.category) ? params.category[0] : params.category;

  const [settings, items] = await Promise.all([getSettings(), getManifestoItems()]);
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const active = requested && categories.includes(requested) ? requested : "all";
  const visible = active === "all" ? items : items.filter((item) => item.category === active);

  return (
    <>
      <PageHeader
        eyebrow="The manifesto"
        title="Ideas Are Only the Beginning."
        intro="Six proposals, written in full. Each one states the issue, the initiative, why it matters, what it aims to achieve, a realistic first step, and what could get in the way."
        meta={
          <>
            <span>{items.length} proposals</span>
            <span aria-hidden="true" className="text-champagne">·</span>
            <span>All labelled by status</span>
            <span aria-hidden="true" className="text-champagne">·</span>
            <span>Updated as things change</span>
          </>
        }
      />

      <section className="bg-paper section-y">
        <div className="shell">
          <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-center md:justify-between">
            <nav aria-label="Filter manifesto by category" className="no-scrollbar flex gap-2 overflow-x-auto">
              <Link
                href={buildHref("all")}
                aria-current={active === "all" ? "page" : undefined}
                className={cx(
                  "shrink-0 border px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] transition-colors",
                  active === "all"
                    ? "border-plum bg-plum text-white"
                    : "border-line text-plum hover:border-purple/40 hover:bg-lavender-50",
                )}
              >
                All themes
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={buildHref(category)}
                  aria-current={active === category ? "page" : undefined}
                  className={cx(
                    "shrink-0 border px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] transition-colors",
                    active === category
                      ? "border-plum bg-plum text-white"
                      : "border-line text-plum hover:border-purple/40 hover:bg-lavender-50",
                  )}
                >
                  {category}
                </Link>
              ))}
            </nav>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-muted">
              {visible.length} shown
            </p>
          </div>

          <div className="mt-12 grid gap-12">
            {visible.map((item, index) => (
              <div key={item.id} data-reveal>
                <ManifestoEntry item={item} index={index} timeZone={settings.timezone} />
              </div>
            ))}
          </div>

          {!visible.length ? (
            <div className="mt-12 border border-dashed border-line-strong bg-ivory px-8 py-16 text-center">
              <p className="font-serif text-2xl text-plum">No proposals in this theme</p>
              <Link href="/manifesto" className="btn btn-secondary mt-6">
                View everything
              </Link>
            </div>
          ) : null}

          <div className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-serif text-[1.6rem] leading-snug text-plum">
                Statuses are honest, not optimistic.
              </p>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted">
                <strong className="font-medium text-plum">Proposed</strong> means exactly
                that — an idea put forward, not an approved programme. A proposal only
                moves to In Progress when work has genuinely begun, and to Awaiting
                Approval when a request has actually been made to{" "}
                {settings.institution}.
              </p>
            </div>
            <Link href="/#progress" className="btn btn-secondary justify-self-start md:justify-self-end">
              See the progress board
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
