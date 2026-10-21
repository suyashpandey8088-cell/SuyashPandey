import Link from "next/link";

import { saveUpdateAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { adminGetSettings, adminListManifesto } from "@/lib/admin-data";
import { updateFields } from "@/lib/admin-forms";
import { utcToZonedInput } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function NewUpdatePage() {
  const [manifesto, settings] = await Promise.all([adminListManifesto(), adminGetSettings()]);
  const fields = updateFields(
    manifesto.map((item) => ({ value: item.id, label: item.title })),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Updates"
        title="New update"
        description="Write it, save it as a draft, schedule it, or publish it now. Nothing appears on the public site until the status is Published."
        actions={
          <Link href="/admin/updates" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            Back to updates
          </Link>
        }
      />

      <Card>
        <AdminRecordForm
          action={saveUpdateAction}
          fields={fields}
          submitLabel="Save update"
          values={{
            status: "draft",
            category: "campaign_news",
            publishedAt: utcToZonedInput(new Date().toISOString(), settings.timezone),
            galleryJson: "[]",
            isPinned: false,
          }}
        />
      </Card>
    </div>
  );
}
