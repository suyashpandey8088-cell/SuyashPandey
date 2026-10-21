import Link from "next/link";

import { ArrowRight } from "@/components/ui";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col justify-center bg-ivory px-6 py-24">
      <div className="mx-auto w-full max-w-3xl">
        <p className="eyebrow">Error 404</p>
        <h1 className="display-serif mt-6 text-display text-plum">
          This page isn&rsquo;t part of the campaign.
        </h1>
        <p className="mt-5 max-w-[52ch] text-lead text-muted">
          The link may be out of date, or the update it pointed to may have been
          unpublished. The campaign itself is still here.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the campaign
            <ArrowRight />
          </Link>
          <Link href="/updates" className="btn btn-secondary">
            Read the latest updates
          </Link>
        </div>

        <nav aria-label="Useful pages" className="mt-14 border-t border-line pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
            <li>
              <Link href="/manifesto" className="transition-colors hover:text-plum">
                Manifesto
              </Link>
            </li>
            <li>
              <Link href="/events" className="transition-colors hover:text-plum">
                Events
              </Link>
            </li>
            <li>
              <Link href="/#voice" className="transition-colors hover:text-plum">
                Student Voice
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-plum">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
