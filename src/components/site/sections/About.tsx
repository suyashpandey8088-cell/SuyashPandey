import Image from "next/image";

import { EditorialLink, Eyebrow } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";

const THEMES = ["Listening", "Participation", "Transparency", "Inclusion"];

export default function About({ settings }: { settings: SiteSettings }) {
  const paragraphs = settings.about_body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-ivory section-y">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* ------------------------------------------------ visual */}
          <div className="order-2 lg:order-1">
            {settings.portrait_url ? (
              <figure className="relative">
                <div
                  data-clip-reveal
                  className="relative aspect-[3/4] overflow-hidden bg-lavender-50 ring-1 ring-line/70"
                >
                  <Image
                    src={settings.portrait_url}
                    alt={settings.portrait_alt || `Portrait of ${settings.candidate_name}`}
                    fill
                    sizes="(max-width: 1024px) 90vw, 36vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-4 border-t border-line pt-3 text-[0.64rem] uppercase tracking-[0.2em] text-muted">
                  {settings.candidate_name} · {settings.institution}
                </figcaption>
              </figure>
            ) : (
              <div
                data-reveal
                className="relative flex aspect-[3/4] flex-col justify-between overflow-hidden bg-lavender-100/70 p-8 ring-1 ring-line/60 md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="eyebrow text-[0.6rem] text-purple/80">Campaign</span>
                  <span
                    aria-hidden="true"
                    className="display-serif text-2xl text-plum/30"
                  >
                    {settings.monogram}
                  </span>
                </div>

                <p className="display-serif text-[2rem] leading-[1.12] text-plum md:text-[2.4rem]">
                  {settings.campaign_slogan}
                </p>

                <ul className="grid gap-2.5">
                  {THEMES.map((theme) => (
                    <li
                      key={theme}
                      className="flex items-center gap-3 border-t border-plum/10 pt-2.5 text-[0.66rem] uppercase tracking-[0.2em] text-plum/60"
                    >
                      <span aria-hidden="true" className="h-px w-2.5 bg-champagne" />
                      {theme}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* -------------------------------------------------- copy */}
          <div className="order-1 lg:order-2">
            <Eyebrow data-reveal>Meet the candidate</Eyebrow>
            <h2
              id="about-heading"
              data-reveal
              className="display-serif mt-7 max-w-[20ch] text-display text-plum"
            >
              {settings.about_heading}
            </h2>

            <div className="mt-8 grid gap-5">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  data-reveal
                  className="max-w-[58ch] text-[1.02rem] leading-[1.78] text-charcoal/85"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {settings.about_philosophy ? (
              <blockquote
                data-reveal
                className="relative mt-10 border-l border-champagne pl-6 md:pl-8"
              >
                <p className="font-serif text-[1.35rem] leading-[1.5] text-plum md:text-[1.5rem]">
                  {settings.about_philosophy}
                </p>
                <footer className="mt-4 text-[0.66rem] uppercase tracking-[0.22em] text-muted">
                  Leadership philosophy
                </footer>
              </blockquote>
            ) : null}

            <dl className="mt-10 grid gap-8 sm:grid-cols-2">
              {settings.about_involvement ? (
                <div data-reveal>
                  <dt className="eyebrow mb-3 text-[0.62rem]">College involvement</dt>
                  <dd className="text-sm leading-relaxed text-charcoal/80">
                    {settings.about_involvement}
                  </dd>
                </div>
              ) : null}
              {settings.about_motivation ? (
                <div data-reveal>
                  <dt className="eyebrow mb-3 text-[0.62rem]">Why I am standing</dt>
                  <dd className="text-sm leading-relaxed text-charcoal/80">
                    {settings.about_motivation}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div data-reveal className="mt-10">
              <EditorialLink href="/manifesto">Explore the campaign manifesto</EditorialLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
