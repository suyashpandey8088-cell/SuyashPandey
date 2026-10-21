import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProgressAction, saveProgressAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import SubmitButton from "@/components/admin/SubmitButton";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { adminGetProgress, adminListUpdates } from "@/lib/admin-data";
import { progressFields } from "@/lib/admin-forms";

export const dynamic = "force-dynamic";

export default async function ProgressEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const [item, updates] = await Promise.all([
    isNew ? Promise.resolve(null) : adminGetProgress(id),
    adminListUpdates("published"),
  ]);

  if (!isNew && !item) notFound();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Progress board"
        title={isNew ? "New progress entry" : item!.initiative_name}
        description="Status changes are public the moment you save. Describe what actually changed, not what you hope will change."
        actions={
          <Link href="/admin/progress" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            All entries
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <Card>
          <AdminRecordForm
            action={saveProgressAction}
            fields={progressFields(
              updates.map((update) => ({ value: update.id, label: update.title })),
            )}
            hidden={item ? { id: item.id } : {}}
            values={
              item
                ? {
                    initiativeName: item.initiative_name,
                    originalProposal: item.original_proposal,
                    status: item.status,
                    percent: item.percent ?? "",
                    progressNote: item.progress_note,
                    relatedUpdateId: item.related_update_id,
                    displayOrder: item.display_order,
                    isVisible: item.is_visible,
                  }
                : { status: "proposed", isVisible: true }
            }
            submitLabel={isNew ? "Create entry" : "Save entry"}
          />
        </Card>

        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
              Status meanings
            </h2>
            <ul className="mt-3 grid gap-2.5 text-[0.76rem] leading-relaxed text-admin-muted">
              <li><strong className="text-plum">Proposed</strong> — put forward, nothing started.</li>
              <li><strong className="text-plum">In Progress</strong> — work has genuinely begun.</li>
              <li><strong className="text-plum">Awaiting Approval</strong> — a request has actually been made to the college.</li>
              <li><strong className="text-plum">Completed</strong> — the described outcome happened.</li>
              <li><strong className="text-plum">On Hold</strong> — paused, with a reason in the note.</li>
            </ul>
          </Card>

          {item ? (
            <Card>
              <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
                Danger zone
              </h2>
              <form action={deleteProgressAction} className="mt-3">
                <input type="hidden" name="id" value={item.id} />
                <SubmitButton
                  variant="danger"
                  pendingLabel="Deleting…"
                  confirmMessage={`Delete the progress entry for “${item.initiative_name}”?`}
                  className="w-full justify-center"
                >
                  Delete entry
                </SubmitButton>
              </form>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
