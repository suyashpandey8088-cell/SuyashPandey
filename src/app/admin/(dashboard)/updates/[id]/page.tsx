import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteUpdateAction, saveUpdateAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import SubmitButton from "@/components/admin/SubmitButton";
import { AdminPageHeader, Badge, Card } from "@/components/admin/ui";
import { adminGetSettings, adminGetUpdate, adminListManifesto } from "@/lib/admin-data";
import { updateFields } from "@/lib/admin-forms";
import { formatDateTime } from "@/lib/format";
import { utcToZonedInput } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function EditUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [update, manifesto, settings] = await Promise.all([
    adminGetUpdate(id),
    adminListManifesto(),
    adminGetSettings(),
  ]);

  if (!update) notFound();

  const fields = updateFields(
    manifesto.map((item) => ({ value: item.id, label: item.title })),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Updates"
        title={update.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge status={update.status} />
            <span className="font-mono text-[0.7rem]">/updates/{update.slug}</span>
          </span>
        }
        actions={
          <>
            <Link href="/admin/updates" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
              All updates
            </Link>
            <Link
              href={`/admin/updates/${update.id}/preview`}
              className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]"
            >
              Preview
            </Link>
            {update.status === "published" ? (
              <Link
                href={`/updates/${update.slug}`}
                target="_blank"
                className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]"
              >
                View live ↗
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Card>
          <AdminRecordForm
            action={saveUpdateAction}
            fields={fields}
            hidden={{ id: update.id }}
            values={{
              title: update.title,
              slug: update.slug,
              summary: update.summary,
              body: update.body,
              category: update.category,
              status: update.status,
              publishedAt: utcToZonedInput(update.published_at, settings.timezone),
              scheduledFor: utcToZonedInput(update.scheduled_for, settings.timezone),
              coverImageUrl: update.cover_image_url,
              coverImageAlt: update.cover_image_alt,
              galleryJson: JSON.stringify(update.gallery ?? []),
              relatedManifestoId: update.related_manifesto_id,
              externalUrl: update.external_url,
              externalLabel: update.external_label,
              isPinned: update.is_pinned,
            }}
            submitLabel="Save changes"
          />
        </Card>

        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
              Record
            </h2>
            <dl className="mt-3 grid gap-3 text-[0.78rem]">
              <div>
                <dt className="text-admin-muted">Created</dt>
                <dd className="text-charcoal/85">{formatDateTime(update.created_at, settings.timezone)}</dd>
              </div>
              <div>
                <dt className="text-admin-muted">Last edited</dt>
                <dd className="text-charcoal/85">{formatDateTime(update.updated_at, settings.timezone)}</dd>
              </div>
              <div>
                <dt className="text-admin-muted">Published</dt>
                <dd className="text-charcoal/85">
                  {update.published_at
                    ? formatDateTime(update.published_at, settings.timezone)
                    : "Not published"}
                </dd>
              </div>
              <div>
                <dt className="text-admin-muted">Scheduled for</dt>
                <dd className="text-charcoal/85">
                  {update.scheduled_for
                    ? formatDateTime(update.scheduled_for, settings.timezone)
                    : "—"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
              Danger zone
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-admin-muted">
              Deleting removes the update permanently, including its public URL. Archive
              it instead if you may want it later.
            </p>
            <form action={deleteUpdateAction} className="mt-3">
              <input type="hidden" name="id" value={update.id} />
              <SubmitButton
                variant="danger"
                pendingLabel="Deleting…"
                confirmMessage={`Delete “${update.title}”? This cannot be undone.`}
                className="w-full justify-center"
              >
                Delete this update
              </SubmitButton>
            </form>
          </Card>
        </aside>
      </div>
    </div>
  );
}
