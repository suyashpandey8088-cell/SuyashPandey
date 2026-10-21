import { SectionHeader, StatusTag } from "@/components/ui";
import type { VisionPillar } from "@/lib/types";

export default function Vision({ pillars }: { pillars: VisionPillar[] }) {
  if (!pillars.length) return null;

  return (
    <section id="vision" aria-labelledby="vision-heading" className="bg-paper section-y">
      <div className="shell">
        <SectionHeader
          eyebrow="Campaign vision"
          title={
            <span id="vision-heading">
              A Better Campus Starts With Us.
            </span>
          }
          intro="Six themes, described the same way each time: what students need, what the approach would be, and what it could change. Every theme is a proposal."
        />

        <ol className="mt-16 border-t border-line">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.id}
              data-reveal
              className="group relative grid gap-6 border-b border-line py-10 transition-colors duration-500 hover:bg-lavender-50/40 md:grid-cols-[8rem_1fr] md:gap-10 md:py-12 lg:grid-cols-[11rem_1fr]"
            >
              <div className="flex items-start gap-4 md:flex-col md:gap-3">
                <span
                  aria-hidden="true"
                  className="display-serif text-[2.1rem] leading-none text-champagne/90 transition-colors duration-500 group-hover:text-purple/60 md:text-[2.6rem]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="eyebrow mt-1 text-[0.6rem] text-muted md:mt-1">
                  {pillar.kicker || "Pillar"}
                </span>
              </div>

              <div className="max-w-4xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h3 className="display-serif text-display-sm text-plum">
                    {pillar.title}
                  </h3>
                  <StatusTag status={pillar.status} />
                </div>

                <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-[1.75] text-charcoal/80">
                  {pillar.summary}
                </p>

                <dl className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-3">
                  {[
                    { term: "Student need", value: pillar.student_need },
                    { term: "Proposed approach", value: pillar.approach },
                    { term: "Potential benefit", value: pillar.benefit },
                  ]
                    .filter((row) => row.value)
                    .map((row) => (
                      <div key={row.term}>
                        <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-purple/85">
                          {row.term}
                        </dt>
                        <dd className="mt-2 text-[0.9rem] leading-[1.65] text-muted">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
