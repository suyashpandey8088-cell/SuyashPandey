import Link from "next/link";

import PortraitFrame from "@/components/site/PortraitFrame";
import { ArrowRight, Eyebrow } from "@/components/ui";
import { splitHeadline } from "@/lib/format";
import type { SiteSettings, UpdatePost } from "@/lib/types";

export default function Hero({
  settings,
  latestUpdate,
}: {
  settings: SiteSettings;
  latestUpdate: UpdatePost | null;
}) {
  const lines = splitHeadline(settings.hero_headline);
  const finalLineIndex = lines.length > 1 ? lines.length - 1 : -1;

  return (
    <section
      aria-labelledby="hero-heading"
      className="grain relative flex min-h-svh items-center overflow-hidden pb-20 pt-32 md:pb-24 md:pt-36"
    >
      {/* Decorative composition — flat shapes, no gradient tricks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-24 hidden h-[34rem] w-[34rem] rounded-full bg-lavender-50/90 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-14 left-0 hidden h-[1px] w-[18rem] bg-champagne/50 md:block"
      />

      <div className="shell relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          {/* ---------------------------------------------------- copy */}
          <div className="order-1">
            <div data-reveal="hero">
              <Eyebrow>{settings.hero_eyebrow}</Eyebrow>
            </div>

            <p
              data-reveal="hero"
              className="mt-7 text-[0.78rem] font-medium uppercase tracking-[0.34em] text-plum"
            >
              {settings.candidate_name}
            </p>

            <h1
              id="hero-heading"
              className="display-serif mt-4 text-hero text-plum"
            >
              {lines.map((line, index) => (
                <span key={line + index} className="block overflow-hidden pb-[0.06em]">
                  <span
                    data-hero-line
                    className={
                      index === finalLineIndex
                        ? "block text-purple"
                        : "block"
                    }
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-reveal="hero"
              className="mt-8 max-w-[46ch] text-lead text-muted"
            >
              {settings.hero_supporting}
            </p>

            <div data-reveal="hero" className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/#vision" className="btn btn-primary">
                Explore My Vision
                <ArrowRight />
              </Link>
              <Link href={latestUpdate ? "/updates" : "/#voice"} className="btn btn-secondary">
                Follow the Campaign
              </Link>
            </div>

            <div
              data-reveal="hero"
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line/80 pt-5 text-[0.68rem] uppercase tracking-[0.18em] text-muted"
            >
              <span>{settings.institution}</span>
              <span aria-hidden="true" className="h-3 w-px bg-champagne/70" />
              <span>Student Council</span>
              <span aria-hidden="true" className="h-3 w-px bg-champagne/70" />
              <span>{settings.campaign_slogan}</span>
            </div>
          </div>

          {/* ------------------------------------------------- portrait */}
          <div className="order-2">
            <div className="mx-auto w-full max-w-[30rem] lg:max-w-none">
              <PortraitFrame
                settings={settings}
                priority
                aspect="aspect-[4/5]"
                caption={`${settings.position_label}`}
              />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          data-reveal="hero"
          className="mt-16 hidden items-center gap-4 text-[0.62rem] uppercase tracking-[0.24em] text-muted md:flex"
        >
          <span className="relative flex h-12 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-4 animate-[scroll-cue_2.6s_ease-in-out_infinite] bg-purple/70" />
          </span>
          Scroll to read the campaign
        </div>
      </div>
    </section>
  );
}
