import Link from "next/link";

import { setUpdateStatusAction } from "@/app/admin/actions";
import SubmitButton from "@/components/admin/SubmitButton";
import {
  AdminPageHeader,
  Badge,
  Banner,
  DataTable,
  EmptyState,
  Td,
  Th,
} from "@/components/admin/ui";
import { adminListUpdates } from "@/lib/admin-data";
import { cx } from "@/lib/cx";
import { formatDateTime, relativeToNow } from "@/lib/format";
import { CONTENT_STATUS_LABELS, UPDATE_CATEGORY_LABELS } from "@/lib/types";
import type { ContentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { value: ContentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "archived", label: "Archived" },
];

export default async function AdminUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = TABS.some((tab) => tab.value === statusParam)
    ? (statusParam as ContentStatus | "all")
    : "all";

  const updates = await adminListUpdates(status === "all" ? undefined : status);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Campaign updates"
        description="Announcements, campaign news, event notices, manifesto updates and progress reports. Published content appears on the public site immediately."
        actions={
          <Link href="/admin/updates/new" className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]">
            New update
          </Link>
        }
      />

      {params.deleted ? <Banner>Update deleted.</Banner> : null}
      {params.published ? (
        <Banner>Any due scheduled updates have been published.</Banner>
      ) : null}

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/updates" : `/admin/updates?status=${tab.value}`}
            aria-current={status === tab.value ? "page" : undefined}
            className={cx(
              "border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors",
              status === tab.value
                ? "border-plum bg-plum text-white"
                : "border-line bg-white text-admin-muted hover:border-purple/40 hover:text-plum",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {updates.length ? (
        <DataTable>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Publication</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {updates.map((update) => (
              <tr key={update.id} className="hover:bg-ivory/60">
                <Td>
                  <Link
                    href={`/admin/updates/${update.id}`}
                    className="font-medium text-plum hover:text-purple-700"
                  >
                    {update.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[0.66rem] text-admin-muted">
                    /updates/{update.slug}
                  </p>
                </Td>
                <Td className="text-[0.8rem] text-charcoal/80">
                  {UPDATE_CATEGORY_LABELS[update.category]}
                </Td>
                <Td>
                  <Badge status={update.status} label={CONTENT_STATUS_LABELS[update.status]} />
                  {update.is_pinned ? (
                    <span className="ml-1.5 text-[0.6rem] uppercase tracking-[0.1em] text-champagne">
                      pinned
                    </span>
                  ) : null}
                </Td>
                <Td className="text-[0.78rem] text-charcoal/80">
                  {update.status === "scheduled" && update.scheduled_for
                    ? `Scheduled · ${formatDateTime(update.scheduled_for)}`
                    : update.published_at
                      ? formatDateTime(update.published_at)
                      : "—"}
                </Td>
                <Td className="text-[0.74rem] text-admin-muted">
                  {relativeToNow(update.updated_at)}
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Link
                      href={`/admin/updates/${update.id}`}
                      className="text-[0.66rem] uppercase tracking-[0.12em] text-purple hover:text-plum"
                    >
                      Edit
                    </Link>
                    {update.status === "published" ? (
                      <>
                        <Link
                          href={`/updates/${update.slug}`}
                          target="_blank"
                          className="text-[0.66rem] uppercase tracking-[0.12em] text-admin-muted hover:text-plum"
                        >
                          View
                        </Link>
                        <form action={setUpdateStatusAction}>
                          <input type="hidden" name="id" value={update.id} />
                          <input type="hidden" name="status" value="draft" />
                          <SubmitButton variant="quiet" pendingLabel="…" className="px-1 py-0 text-[0.66rem] normal-case tracking-[0.12em]">
                            Unpublish
                          </SubmitButton>
                        </form>
                      </>
                    ) : (
                      <form action={setUpdateStatusAction}>
                        <input type="hidden" name="id" value={update.id} />
                        <input type="hidden" name="status" value="published" />
                        <SubmitButton variant="quiet" pendingLabel="…" className="px-1 py-0 text-[0.66rem] normal-case tracking-[0.12em]">
                          Publish
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : (
        <EmptyState
          title={status === "all" ? "No updates yet" : `No ${status} updates`}
          body="Announcements you publish here appear on the public site immediately, with the date and category you set. Drafts stay private until you publish them."
          action={
            <Link href="/admin/updates/new" className="btn btn-primary">
              Write the first update
            </Link>
          }
        />
      )}
    </div>
  );
}
