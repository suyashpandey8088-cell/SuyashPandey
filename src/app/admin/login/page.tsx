import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/admin/LoginForm";
import { isAdministrator } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  signin: "Please sign in to continue to the campaign dashboard.",
  "not-admin":
    "That account is not authorised to manage this campaign. Sign in with the campaign owner's account.",
  "signed-out": "You have been signed out.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await isAdministrator()) redirect("/admin");

  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const settings = await getSettings();

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Editorial panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-lavender-100/70 p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-champagne/50"
        />
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/80 font-serif text-[0.7rem] tracking-[0.1em] text-plum">
            {settings.monogram}
          </span>
          <span className="text-[0.8rem] uppercase tracking-[0.28em] text-plum">
            {settings.candidate_name}
          </span>
        </Link>

        <div className="relative max-w-[26rem]">
          <p className="eyebrow text-plum/60">Campaign dashboard</p>
          <p className="mt-6 font-serif text-[2.4rem] leading-[1.1] text-plum">
            {settings.campaign_slogan}
          </p>
          <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-plum/70">
            Publish announcements, keep the manifesto honest, and answer students —
            without touching code.
          </p>
        </div>

        <p className="relative text-[0.66rem] uppercase tracking-[0.18em] text-plum/50">
          Private · {settings.institution} Student Council
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-16 md:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-purple">
            Authorised access only
          </p>
          <h1 className="mt-3 font-serif text-[2.2rem] leading-tight text-plum">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-admin-muted">
            Manage the campaign website. This area is not part of the public site.
          </p>

          <div className="mt-8">
            <LoginForm notice={reason ? NOTICES[reason] : undefined} />
          </div>

          <div className="mt-10 border-t border-line pt-5">
            <Link
              href="/"
              className="text-[0.68rem] uppercase tracking-[0.16em] text-admin-muted transition-colors hover:text-plum"
            >
              ← Back to the campaign site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
