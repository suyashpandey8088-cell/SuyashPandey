import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import CopyLinkButton from "@/components/site/CopyLinkButton";
import UpdateCard from "@/components/site/UpdateCard";
import { ArrowRight, ArrowUpRight, StatusTag, Tag } from "@/components/ui";
import {
  getManifestoItems,
  getSettings,
  getUpdateBySlug,
  getUpdates,
} from "@/lib/data";
import { formatDateTime, readingTime, safeExternalUrl } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { UPDATE_CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const update = await getUpdateBySlug(slug);
  if (!update) return { title: "Update not found" };

  const url = `/updates/${update.slug}`;
  const images = update.cover_image_url
    ? [{ url: update.cover_image_url, alt: update.cover_image_alt ?? update.title }]
    : undefined;

  return {
    title: update.title,
    description: update.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: update.title,
      description: update.summary,
      url,
      publishedTime: update.published_at ?? undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: update.title,
      description: update.summary,
      images: update.cover_image_url ? [update.cover_image_url] : undefined,
    },
  };
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const update = await getUpdateBySlug(slug);
  if (!update) notFound();

  const [settings, manifesto, latest] = await Promise.all([
    getSettings(),
    getManifestoItems(),
    getUpdates({ limit: 3 }),
  ]);

  const related = update.related_manifesto_id
    ? manifesto.find((item) => item.id === update.related_manifesto_id)
    : undefined;
  const external = safeExternalUrl(update.external_url);
  const more = latest.items.filter((item) => item.id !== update.id).slice(0, 2);
  const html = renderMarkdown(update.body);

  return (
    <>
      <article>
        {/* ------------------------------------------------------- header */}
        <header className="border-b border-line bg-ivory pb-12 pt-32 md:pb-16 md:pt-40">
          <div className="shell">
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-plum"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              All updates
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Tag>{UPDATE_CATEGORY_LABELS[update.category]}</Tag>
              {update.is_pinned ? <Tag tone="champagne">Pinned</Tag> : null}
              <span className="text-[0.66rem] uppercase tracking-[0.16em] text-muted">
                {formatDateTime(update.published_at, settings.timezone)}
              </span>
              <span aria-hidden="true" className="text-champagne">·</span>
              <span className="text-[0.66rem] uppercase tracking-[0.16em] text-muted">
                {readingTime(update.body)} min read
              </span>
            </div>

            <h1 className="display-serif mt-6 max-w-[26ch] text-display text-plum">
              {update.title}
            </h1>

            {update.summary ? (
              <p className="mt-6 max-w-[62ch] text-lead text-muted">{update.summary}</p>
            ) : null}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <CopyLinkButton url={`/updates/${update.slug}`} />
              {external ? (
                <a
                  href={external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-line px-3.5 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-plum transition-colors hover:border-purple/40 hover:bg-lavender-50"
                >
                  {update.external_label || "External link"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </header>

        {/* -------------------------------------------------------- body */}
        <div className="bg-paper">
          {update.cover_image_url ? (
            <div className="shell pt-10">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-lavender-50 ring-1 ring-line/60">
                <Image
                  src={update.cover_image_url}
                  alt={update.cover_image_alt ?? update.title}
                  fill
                  priority
                  sizes="(max-width: 1280px) 92vw, 80rem"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="shell py-14 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
              <div
                className="prose-campaign max-w-[68ch]"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              <aside className="lg:border-l lg:border-line lg:pl-10">
                <p className="eyebrow text-[0.6rem]">Details</p>
                <dl className="mt-5 grid gap-4 text-sm">
                  <div>
                    <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-muted">
                      Published
                    </dt>
                    <dd className="mt-1 text-charcoal/85">
                      {formatDateTime(update.published_at, settings.timezone)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-muted">
                      Category
                    </dt>
                    <dd className="mt-1 text-charcoal/85">
                      {UPDATE_CATEGORY_LABELS[update.category]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-muted">
                      Last edited
                    </dt>
                    <dd className="mt-1 text-charcoal/85">
                      {formatDateTime(update.updated_at, settings.timezone)}
                    </dd>
                  </div>
                </dl>

                {related ? (
                  <div className="mt-8 border-t border-line pt-6">
                    <p className="eyebrow text-[0.6rem]">Related proposal</p>
                    <Link
                      href="/manifesto"
                      className="mt-3 block font-serif text-[1.2rem] leading-snug text-plum hover:text-purple-700"
                    >
                      {related.title}
                    </Link>
                    <div className="mt-3">
                      <StatusTag status={related.status} />
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-[0.72rem] leading-relaxed text-muted">
                    This is a campaign communication, not an official{" "}
                    {settings.institution} announcement.
                  </p>
                </div>
              </aside>
            </div>

            {update.gallery.length ? (
              <div className="mt-14 grid gap-4 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
                {update.gallery.map((image) => (
                  <figure key={image.url} className="relative aspect-[4/3] overflow-hidden bg-lavender-50">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 92vw, 30vw"
                      className="object-cover"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {/* ----------------------------------------------------- more updates */}
      {more.length ? (
        <section className="border-t border-line bg-ivory section-y">
          <div className="shell">
            <div className="flex items-end justify-between gap-6">
              <h2 className="display-serif text-display-sm text-plum">More updates</h2>
              <Link href="/updates" className="link-editorial">
                All updates
                <ArrowRight />
              </Link>
            </div>
            <div className="mt-10 grid gap-8 border-t border-line pt-10 md:grid-cols-2">
              {more.map((item) => (
                <UpdateCard key={item.id} update={item} timeZone={settings.timezone} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
