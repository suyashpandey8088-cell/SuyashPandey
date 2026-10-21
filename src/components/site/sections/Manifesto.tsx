import Link from "next/link";

import ManifestoEntry from "@/components/site/ManifestoEntry";
import { ArrowRight, EditorialLink, SectionHeader } from "@/components/ui";
import type { ManifestoItem, SiteSettings } from "@/lib/types";

export default function Manifesto({
  items,
  settings,
}: {
  items: ManifestoItem[];
  settings: SiteSettings;
}) {
  if (!items.length) return null;
  const preview = items.slice(0, 3);

  return (
    <section
      id="manifesto"
      aria-labelledby="manifesto-heading"
      className="bg-ivory section-y"
    >
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="The manifesto"
            title={<span id="manifesto-heading">Ideas Are Only the Beginning.</span>}
            intro="Each proposal is written the same way, so it can be judged the same way — the issue, the initiative, the outcome, the first step, and what could get in the way."
          />
          <div data-reveal className="shrink-0 md:pb-2">
            <Link href="/manifesto" className="btn btn-secondary">
              All six proposals
              <ArrowRight />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-12">
          {preview.map((item, index) => (
            <div key={item.id} data-reveal>
              <ManifestoEntry item={item} index={index} timeZone={settings.timezone} />
            </div>
          ))}
        </div>

        <div data-reveal className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="max-w-[52ch] text-xs leading-relaxed text-muted">
            Every item here is labelled <strong className="font-medium text-plum">Proposed</strong>{" "}
            unless its status says otherwise. Nothing on this site implies approval,
            funding or endorsement by {settings.institution}.
          </p>
          <EditorialLink href="/manifesto">Read the full manifesto</EditorialLink>
        </div>
      </div>
    </section>
  );
}
