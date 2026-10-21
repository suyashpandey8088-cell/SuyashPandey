import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteVisionAction, saveVisionAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import SubmitButton from "@/components/admin/SubmitButton";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { adminGetVision, adminListVision } from "@/lib/admin-data";
import { visionFields } from "@/lib/admin-forms";

export const dynamic = "force-dynamic";

export default async function VisionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const [pillar, all] = await Promise.all([
    isNew ? Promise.resolve(null) : adminGetVision(id),
    adminListVision(),
  ]);

  if (!isNew && !pillar) notFound();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Vision"
        title={isNew ? "New pillar" : pillar!.title}
        description="Short, specific panels read better than long ones. Keep each field to one or two sentences."
        actions={
          <Link href="/admin/vision" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            All pillars
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <Card>
          <AdminRecordForm
            action={saveVisionAction}
            fields={visionFields()}
            hidden={pillar ? { id: pillar.id } : {}}
            values={
              pillar
                ? {
                    title: pillar.title,
                    slug: pillar.slug,
                    kicker: pillar.kicker,
                    status: pillar.status,
                    summary: pillar.summary,
                    studentNeed: pillar.student_need,
                    approach: pillar.approach,
                    benefit: pillar.benefit,
                    displayOrder: pillar.display_order,
                    isVisible: pillar.is_visible,
                  }
                : { status: "proposed", isVisible: true, displayOrder: all.length + 1 }
            }
            submitLabel={isNew ? "Create pillar" : "Save pillar"}
          />
        </Card>

        {pillar ? (
          <aside className="self-start">
            <Card>
              <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
                Danger zone
              </h2>
              <form action={deleteVisionAction} className="mt-3">
                <input type="hidden" name="id" value={pillar.id} />
                <SubmitButton
                  variant="danger"
                  pendingLabel="Deleting…"
                  confirmMessage={`Delete the pillar “${pillar.title}”?`}
                  className="w-full justify-center"
                >
                  Delete pillar
                </SubmitButton>
              </form>
            </Card>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
