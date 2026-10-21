import Link from "next/link";

import { saveSettingsAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import { AdminPageHeader, Banner, Card } from "@/components/admin/ui";
import { adminGetSettings } from "@/lib/admin-data";
import {
  PROFILE_FIELD_NAMES,
  hiddenSettings,
  profileFields,
  settingsValues,
} from "@/lib/admin-settings-fields";

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage() {
  const settings = await adminGetSettings();
  const values = settingsValues(settings);
  const hidden = hiddenSettings(settings, PROFILE_FIELD_NAMES);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Candidate profile"
        description="Who the campaign is about. This copy appears in the hero, the About section and the footer."
        actions={
          <Link href="/" target="_blank" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            View public site ↗
          </Link>
        }
      />

      <Banner tone="info">
        The biography is written to be edited. Add only what is accurate — qualifications,
        involvement and achievements are yours to state, and nothing here should be
        invented on the campaign&rsquo;s behalf.
      </Banner>

      <Card>
        <AdminRecordForm
          action={saveSettingsAction}
          fields={profileFields()}
          values={values}
          hidden={hidden}
          submitLabel="Save profile"
          footer={
            <p className="text-xs leading-relaxed text-admin-muted">
              Saving here never changes website settings, section visibility or social
              links — those are passed through unchanged.
            </p>
          }
        />
      </Card>
    </div>
  );
}
