"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[campaign] rendering error", error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col justify-center bg-ivory px-6 py-24">
      <div className="mx-auto w-full max-w-2xl">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display-serif mt-6 text-display text-plum">
          This section couldn&rsquo;t load.
        </h1>
        <p className="mt-5 max-w-[52ch] text-lead text-muted">
          A temporary problem stopped part of the page from rendering. Your data is
          unaffected — nothing was submitted or changed.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to the campaign
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-8 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
            Reference · {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
