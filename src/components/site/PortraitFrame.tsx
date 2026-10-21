import Image from "next/image";

import { cx } from "@/lib/cx";
import type { SiteSettings } from "@/lib/types";

/**
 * The campaign portrait.
 *
 * Until a real photograph is uploaded from the dashboard, this renders a
 * deliberately designed graphic — never a fabricated image of the candidate.
 */
export default function PortraitFrame({
  settings,
  priority = false,
  aspect = "aspect-[4/5]",
  caption,
  className,
}: {
  settings: SiteSettings;
  priority?: boolean;
  aspect?: string;
  caption?: string;
  className?: string;
}) {
  const hasPortrait = Boolean(settings.portrait_url);

  return (
    <figure className={cx("portrait-frame", className)}>
      <div
        data-clip-reveal
        className={cx(
          "relative overflow-hidden bg-lavender-50 ring-1 ring-line/70",
          aspect,
        )}
      >
        {hasPortrait ? (
          <Image
            src={settings.portrait_url as string}
            alt={settings.portrait_alt || `Portrait of ${settings.candidate_name}`}
            fill
            sizes="(max-width: 1024px) 92vw, 44vw"
            priority={priority}
            className="object-cover object-center"
          />
        ) : (
          <div className="portrait-placeholder absolute inset-0 flex flex-col justify-between p-7 md:p-9">
            <div className="flex items-start justify-between gap-4">
              <span className="eyebrow text-[0.6rem] text-purple/75">
                {settings.institution}
              </span>
              <span className="eyebrow text-[0.6rem] text-purple/75">
                {settings.monogram}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <span
                aria-hidden="true"
                className="display-serif text-[5.5rem] leading-none text-plum/20 md:text-[7.5rem]"
              >
                {settings.monogram}
              </span>
              <span className="mt-4 h-px w-14 bg-champagne/80" aria-hidden="true" />
              <p className="mt-4 text-[0.66rem] uppercase tracking-[0.24em] text-plum/55">
                Campaign portrait
              </p>
              <p className="mt-1.5 text-xs text-muted">To be published</p>
            </div>

            <div className="rule-champagne" aria-hidden="true" />
          </div>
        )}
      </div>

      <figcaption className="mt-5 flex items-baseline justify-between gap-4 border-t border-line/80 pt-3">
        <span className="text-[0.66rem] uppercase tracking-[0.2em] text-plum/70">
          {caption ?? settings.candidate_name}
        </span>
        <span className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
          {settings.institution}
        </span>
      </figcaption>
    </figure>
  );
}
