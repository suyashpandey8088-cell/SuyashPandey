import Link from "next/link";

import { signOutAction } from "@/app/admin/actions";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { adminDashboard, adminGetSettings } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Authoritative guard: redirects unauthenticated visitors and any signed-in
  // user who is not on the administrator allow-list.
  const admin = await requireAdmin();
  const [settings, stats] = await Promise.all([adminGetSettings(), adminDashboard()]);

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-lavender-50/50 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <div className="flex h-full flex-col justify-between gap-8 px-4 py-6">
          <div>
            <Link href="/admin" className="flex items-center gap-3 px-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/80 font-serif text-[0.7rem] tracking-[0.1em] text-plum">
                {settings.monogram}
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[0.74rem] font-medium uppercase tracking-[0.2em] text-plum">
                  {settings.candidate_name}
                </span>
                <span className="mt-1.5 text-[0.56rem] uppercase tracking-[0.2em] text-admin-muted">
                  Campaign admin
                </span>
              </span>
            </Link>

            <div className="mt-8">
              <AdminNav newFeedback={stats.newFeedback} />
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-[0.8rem] text-charcoal/75 transition-colors hover:text-plum"
            >
              View public site
              <span aria-hidden="true">↗</span>
            </Link>

            <div className="mt-3 rounded-sm bg-white/70 px-3 py-2.5">
              <p className="truncate text-[0.72rem] font-medium text-plum">{admin.displayName}</p>
              <p className="truncate text-[0.66rem] text-admin-muted">{admin.email}</p>
              <form action={signOutAction} className="mt-2">
                <button
                  type="submit"
                  className="text-[0.64rem] uppercase tracking-[0.14em] text-admin-muted transition-colors hover:text-[#96433c]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
