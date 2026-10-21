import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui";

export default function PageHeader({
  eyebrow,
  title,
  intro,
  meta,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-ivory pb-14 pt-32 md:pb-20 md:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 hidden h-80 w-80 rounded-full bg-lavender-50/80 lg:block"
      />
      <div className="shell relative">
        <Eyebrow data-reveal="hero">{eyebrow}</Eyebrow>
        <h1
          data-reveal="hero"
          className="display-serif mt-6 max-w-[24ch] text-display text-plum"
        >
          {title}
        </h1>
        {intro ? (
          <p data-reveal="hero" className="mt-6 max-w-[58ch] text-lead text-muted">
            {intro}
          </p>
        ) : null}
        {meta ? (
          <div
            data-reveal="hero"
            className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.66rem] uppercase tracking-[0.18em] text-muted"
          >
            {meta}
          </div>
        ) : null}
      </div>
    </header>
  );
}
