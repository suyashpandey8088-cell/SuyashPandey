import Link from "next/link";

import { saveSettingsAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import { AdminPageHeader, Banner, Card } from "@/components/admin/ui";
import { adminGetSettings, adminListUpdates } from "@/lib/admin-data";
import {
  SETTINGS_FIELD_NAMES,
  hiddenSettings,
  settingsFields,
  settingsValues,
} from "@/lib/admin-settings-fields";

export const dynamic = "force-dynamic";

export default async function WebsiteSettingsPage() {
  const [settings, updates] = await Promise.all([adminGetSettings(), adminListUpdates("published")]);

  const values = settingsValues(settings);
  const hidden = hiddenSettings(settings, SETTINGS_FIELD_NAMES);
  const fields = settingsFields(
    updates.map((update) => ({ value: update.id, label: update.title })),
  );

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Website settings"
        description="Homepage copy, contact details, social links, the featured announcement, section visibility and the campaign palette."
        actions={
          <Link href="/" target="_blank" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            View public site ↗
          </Link>
        }
      />

      <Banner tone="info">
        Content is stored in the database, so changes persist across devices and sessions
        and appear on the public site immediately.
      </Banner>

      <Card>
        <AdminRecordForm
          action={saveSettingsAction}
          fields={fields}
          values={values}
          hidden={{ ...hidden, fullSettings: "1" }}
          submitLabel="Save website settings"
          footer={
            <p className="text-xs leading-relaxed text-admin-muted">
              Keep the accent colours inside the established identity — muted purple
              #76639A with deep plum #443451. Bright golds and high-saturation purples
              break the design system.
            </p>
          }
        />
      </Card>
    </div>
  );
}
