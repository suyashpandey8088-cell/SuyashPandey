import Link from "next/link";

import PasswordForm from "@/components/admin/PasswordForm";
import { AdminPageHeader, Banner, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Account"
        description="The address that can manage this website, and the password that protects it."
        actions={
          <Link href="/" target="_blank" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            View public site ↗
          </Link>
        }
      />

      <Banner tone="info">
        If you arrived with a temporary password, change it now. Nothing else on the
        site depends on it, and no one at NIAT has access to it.
      </Banner>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Card>
          <h2 className="font-serif text-2xl text-plum">Change password</h2>
          <p className="mt-1 mb-6 text-sm leading-relaxed text-admin-muted">
            At least 10 characters. A passphrase is easiest to remember.
          </p>
          <PasswordForm />
        </Card>

        <Card>
          <h2 className="font-serif text-2xl text-plum">Signed in as</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-admin-muted">
                Email
              </dt>
              <dd className="mt-1 break-all text-charcoal">{admin.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-admin-muted">
                Access
              </dt>
              <dd className="mt-1 text-charcoal">Campaign owner · full access</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-admin-muted">
                How access works
              </dt>
              <dd className="mt-1 text-xs leading-relaxed text-admin-muted">
                Authorisation comes from a row in the database allow-list, not from
                this page. Removing that row revokes access immediately, even if the
                password is unchanged.
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
