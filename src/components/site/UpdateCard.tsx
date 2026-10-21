import Link from "next/link";

import { ArrowUpRight, Tag } from "@/components/ui";
import { cx } from "@/lib/cx";
import { formatDate } from "@/lib/format";
import { UPDATE_CATEGORY_LABELS, type UpdatePost } from "@/lib/types";

export default function UpdateCard({
  update,
  timeZone,
  featured = false,
}: {
  update: UpdatePost;
  timeZone?: string;
  featured?: boolean;
}) {
  const date = formatDate(update.published_at, timeZone);

  if (featured) {
    return (
      <Link
        href={`/updates/${update.slug}`}
        data-reveal
        className="group grid overflow-hidden border border-line bg-paper transition-colors duration-500 hover:border-purple/35 md:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <Tag tone="ink">Featured</Tag>
            <Tag tone="neutral">{UPDATE_CATEGORY_LABELS[update.category]}</Tag>
            <span className="text-[0.66rem] uppercase tracking-[0.18em] text-muted">
              {date}
            </span>
          </div>

          <h3 className="display-serif mt-6 max-w-[24ch] text-display-sm text-plum transition-colors duration-300 group-hover:text-purple-700">
            {update.title}
          </h3>

          <p className="mt-4 max-w-[52ch] text-[1rem] leading-[1.75] text-muted">
            {update.summary}
          </p>

          <span className="link-editorial mt-8 inline-flex">
            Read the announcement
            <ArrowUpRight />
          </span>
        </div>

        <div className="relative hidden overflow-hidden bg-lavender-100/70 md:block">
          {update.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={update.cover_image_url}
              alt={update.cover_image_alt ?? ""}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-10">
              <span className="eyebrow text-[0.6rem] text-purple/70">Campaign bulletin</span>
              <span
                aria-hidden="true"
                className="display-serif self-end text-[7rem] leading-none text-plum/15"
              >
                SP
              </span>
              <p className="font-serif text-[1.5rem] leading-snug text-plum/80">
                {update.is_pinned ? "Pinned announcement" : "Latest announcement"}
              </p>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/updates/${update.slug}`}
      data-reveal
      className={cx(
        "group flex flex-col justify-between gap-6 border-b border-line pb-7 transition-colors duration-300",
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-purple/85">
            {UPDATE_CATEGORY_LABELS[update.category]}
          </span>
          <span aria-hidden="true" className="h-px w-3 bg-champagne" />
          <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            {date}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-[1.45rem] leading-[1.22] text-plum transition-colors duration-300 group-hover:text-purple-700">
          {update.title}
        </h3>
        <p className="mt-2.5 max-w-[52ch] text-[0.94rem] leading-[1.7] text-muted">
          {update.summary}
        </p>
      </div>
      <span className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.18em] text-plum/70">
        Read update
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
