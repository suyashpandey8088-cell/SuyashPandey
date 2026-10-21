import Link from "next/link";

import { ArrowRight, ArrowUpRight } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

const LINKS = [
  { label: "Explore the manifesto", href: "/manifesto" },
  { label: "Read the latest updates", href: "/updates" },
  { label: "Discover upcoming events", href: "/events" },
  { label: "Share an idea", href: "/#voice" },
];

export default function Closing({ settings }: { settings: SiteSettings }) {
  const electionDate = settings.election_date
    ? formatDate(settings.election_date, settings.timezone)
    : null;

  return (
    <section aria-labelledby="closing-heading" className="bg-ivory">
      <div className="shell pb-8 pt-8 md:pb-16">
        <div className="relative overflow-hidden bg-lavender-100/80 px-8 py-16 md:px-16 md:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-champagne/40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-lavender/40"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <p data-reveal className="eyebrow text-plum/70">
                The closing word
              </p>
              <h2
                id="closing-heading"
                data-reveal
                className="display-serif mt-6 max-w-[18ch] text-display text-plum"
              >
                {settings.closing_heading}
              </h2>
              <p data-reveal className="mt-6 max-w-[52ch] text-lead text-plum/70">
                {settings.closing_body}
              </p>

              {electionDate ? (
                <p
                  data-reveal
                  className="mt-8 inline-flex items-center gap-3 border border-plum/15 px-4 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-plum/75"
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-champagne" />
                  Election · {electionDate}
                </p>
              ) : null}
            </div>

            <div className="lg:pt-2">
              <ul className="grid gap-0">
                {LINKS.map((link, index) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-reveal
                      className="group flex items-center justify-between gap-4 border-t border-plum/15 py-4 transition-colors duration-300 hover:border-plum/35"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="text-[0.58rem] tabular-nums tracking-[0.1em] text-plum/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-serif text-[1.35rem] leading-tight text-plum transition-colors duration-300 group-hover:text-purple-900">
                          {link.label}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-plum/50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/#voice"
                data-reveal
                className="btn btn-primary mt-8 w-full bg-plum hover:bg-purple-900"
              >
                Share your idea
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
