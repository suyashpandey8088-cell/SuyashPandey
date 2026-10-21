import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Banner } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { adminGetSettings, adminGetUpdate } from "@/lib/admin-data";
import { formatDateTime, readingTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { UPDATE_CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Draft preview. Rendered only for a signed-in administrator, so unpublished
 * content is never exposed on a public URL.
 */
export default async function UpdatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [update, settings] = await Promise.all([adminGetUpdate(id), adminGetSettings()]);
  if (!update) notFound();

  return (
    <div className="grid gap-5">
      <Banner tone="info">
        This is a private preview. The status is{" "}
        <strong className="font-medium">{update.status}</strong>
        {update.status !== "published"
          ? " — it is not visible on the public site yet."
          : " — this is what visitors currently see."}
      </Banner>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/updates/${update.id}`} className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
          ← Back to the editor
        </Link>
        {update.status === "published" ? (
          <Link
            href={`/updates/${update.slug}`}
            target="_blank"
            className="text-[0.68rem] uppercase tracking-[0.12em] text-purple hover:text-plum"
          >
            Open the live page ↗
          </Link>
        ) : null}
      </div>

      <article className="overflow-hidden rounded-sm border border-line bg-white">
        <header className="border-b border-line px-6 py-10 md:px-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge status={update.status} />
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-admin-muted">
              {UPDATE_CATEGORY_LABELS[update.category]}
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-admin-muted">
              {update.published_at
                ? formatDateTime(update.published_at, settings.timezone)
                : "Unpublished"}
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-admin-muted">
              {readingTime(update.body)} min read
            </span>
          </div>
          <h1 className="mt-5 max-w-[26ch] font-serif text-[2.6rem] leading-[1.05] text-plum">
            {update.title}
          </h1>
          {update.summary ? (
            <p className="mt-4 max-w-[62ch] text-[1.05rem] leading-relaxed text-admin-muted">
              {update.summary}
            </p>
          ) : null}
        </header>

        {update.cover_image_url ? (
          <div className="relative aspect-[16/9] w-full bg-ivory">
            <Image
              src={update.cover_image_url}
              alt={update.cover_image_alt ?? ""}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="px-6 py-10 md:px-12">
          <div
            className="prose-campaign max-w-[68ch]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(update.body) }}
          />
        </div>
      </article>
    </div>
  );
}
