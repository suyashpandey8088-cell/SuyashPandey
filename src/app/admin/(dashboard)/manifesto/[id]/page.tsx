import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteManifestoAction, saveManifestoAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import SubmitButton from "@/components/admin/SubmitButton";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { adminGetManifesto, adminListManifesto } from "@/lib/admin-data";
import { manifestoFields } from "@/lib/admin-forms";

export const dynamic = "force-dynamic";

export default async function ManifestoEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const [item, all] = await Promise.all([
    isNew ? Promise.resolve(null) : adminGetManifesto(id),
    adminListManifesto(),
  ]);

  if (!isNew && !item) notFound();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Manifesto"
        title={isNew ? "New proposal" : item!.title}
        description={
          isNew
            ? "Write the proposal exactly as you want it published. Every field is shown on the public manifesto page."
            : `Last updated ${new Date(item!.updated_at).toDateString()} · theme ${item!.category}`
        }
        actions={
          <Link href="/admin/manifesto" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            All proposals
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <Card>
          <AdminRecordForm
            action={saveManifestoAction}
            fields={manifestoFields()}
            hidden={item ? { id: item.id } : {}}
            values={
              item
                ? {
                    title: item.title,
                    slug: item.slug,
                    category: item.category,
                    status: item.status,
                    issue: item.issue,
                    proposal: item.proposal,
                    whyItMatters: item.why_it_matters,
                    outcome: item.outcome,
                    firstStep: item.first_step,
                    considerations: item.considerations,
                    displayOrder: item.display_order,
                    isVisible: item.is_visible,
                  }
                : {
                    status: "proposed",
                    isVisible: true,
                    displayOrder: all.length + 1,
                    category: "Student Voice",
                  }
            }
            submitLabel={isNew ? "Create proposal" : "Save proposal"}
          />
        </Card>

        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
              Writing guide
            </h2>
            <ul className="mt-3 grid gap-2.5 text-[0.76rem] leading-relaxed text-admin-muted">
              <li>
                <strong className="font-medium text-plum">Proposed</strong> is the honest
                default. Only change it when something has genuinely happened.
              </li>
              <li>Never imply approval, funding or endorsement by the college.</li>
              <li>Keep the first step small enough that it could actually start.</li>
              <li>Considerations are not weaknesses — they build trust.</li>
            </ul>
          </Card>

          {item ? (
            <Card>
              <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
                Danger zone
              </h2>
              <form action={deleteManifestoAction} className="mt-3">
                <input type="hidden" name="id" value={item.id} />
                <SubmitButton
                  variant="danger"
                  pendingLabel="Deleting…"
                  confirmMessage={`Delete “${item.title}”? This cannot be undone.`}
                  className="w-full justify-center"
                >
                  Delete proposal
                </SubmitButton>
              </form>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
