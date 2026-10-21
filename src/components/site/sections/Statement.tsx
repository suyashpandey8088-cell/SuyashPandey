import { Eyebrow } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";

export default function Statement({ settings }: { settings: SiteSettings }) {
  return (
    <section
      id="statement"
      aria-labelledby="statement-heading"
      className="relative bg-paper section-y"
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="relative lg:pr-10">
            <Eyebrow data-reveal>Campaign statement</Eyebrow>
            <h2
              id="statement-heading"
              data-reveal
              className="display-serif mt-7 max-w-[16ch] text-display text-plum"
            >
              {settings.statement_heading}
            </h2>
          </div>

          <div className="lg:pt-16">
            <div data-reveal className="mb-8 h-px w-24 bg-champagne" aria-hidden="true" />
            <p data-reveal className="font-serif text-[1.4rem] leading-[1.55] text-plum/90 md:text-[1.62rem]">
              {settings.statement_body}
            </p>
            <div data-reveal className="mt-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-8 w-px bg-champagne/80" />
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                {settings.candidate_name} · {settings.institution}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
