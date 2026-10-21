"use client";

import { useState } from "react";

import { cx } from "@/lib/cx";

export default function CopyLinkButton({
  url,
  className,
  label = "Copy link",
}: {
  url: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.share && window.matchMedia("(max-width: 640px)").matches) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard permissions can be denied; fall back to a prompt-free no-op.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cx(
        "inline-flex items-center gap-2 border border-line px-3.5 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-plum transition-colors hover:border-purple/40 hover:bg-lavender-50",
        className,
      )}
      aria-live="polite"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
        {copied ? (
          <path
            d="m4.5 10.5 3.5 3.5 7.5-8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <rect x="7" y="7" width="9" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M13 5.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v6.5A1.5 1.5 0 0 0 5 13h.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      {copied ? "Link copied" : label}
    </button>
  );
}
