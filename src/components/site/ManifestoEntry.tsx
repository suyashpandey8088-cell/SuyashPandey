import { StatusTag } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { INITIATIVE_STATUS_LABELS, type ManifestoItem } from "@/lib/types";

/**
 * The full proposal, rendered the same way everywhere: issue, initiative,
 * why it matters, intended outcome, first step, considerations, status and the
 * date it was last changed. Nothing is summarised away.
 */
export default function ManifestoEntry({
  item,
  index,
  timeZone,
  compact = false,
}: {
  item: ManifestoItem;
  index?: number;
  timeZone?: string;
  compact?: boolean;
}) {
  const rows = [
    { term: "The issue", value: item.issue },
    { term: "The proposed initiative", value: item.proposal },
    { term: "Why it matters to students", value: item.why_it_matters },
    { term: "Intended outcome", value: item.outcome },
    { term: "A realistic first step", value: item.first_step },
    { term: "Implementation considerations", value: item.considerations },
  ].filter((row) => row.value);

  return (
    <article className="group border-t border-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.2em] text-purple/85">
          {typeof index === "number" ? (
            <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          ) : null}
          <span aria-hidden="true" className="h-px w-5 bg-champagne" />
          {item.category}
        </p>
        <StatusTag status={item.status} />
      </div>

      <h3 className="display-serif mt-5 text-display-sm text-plum">{item.title}</h3>

      {item.proposal ? (
        <p className="mt-4 max-w-[64ch] text-[1.02rem] leading-[1.75] text-charcoal/85">
          {item.proposal}
        </p>
      ) : null}

      <dl
        className={
          compact
            ? "mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-2"
            : "mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2"
        }
      >
        {rows
          .filter((row) => row.term !== "The proposed initiative")
          .map((row) => (
            <div key={row.term}>
              <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-purple/85">
                {row.term}
              </dt>
              <dd className="mt-2 text-[0.92rem] leading-[1.7] text-muted">{row.value}</dd>
            </div>
          ))}
      </dl>

      <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.66rem] uppercase tracking-[0.16em] text-muted/80">
        <span>Status · {INITIATIVE_STATUS_LABELS[item.status]}</span>
        <span aria-hidden="true" className="text-champagne">
          ·
        </span>
        <span>Last updated {formatDate(item.updated_at, timeZone)}</span>
      </p>
    </article>
  );
}
