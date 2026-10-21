import { ArrowUpRight, Tag } from "@/components/ui";
import { dateParts, formatTime, safeExternalUrl } from "@/lib/format";
import type { CampaignEvent } from "@/lib/types";

export default function EventCard({
  event,
  timeZone,
  past = false,
}: {
  event: CampaignEvent;
  timeZone?: string;
  past?: boolean;
}) {
  const parts = dateParts(event.starts_at, timeZone);
  const startTime = formatTime(event.starts_at, timeZone);
  const endTime = event.ends_at ? formatTime(event.ends_at, timeZone) : null;
  const registration = safeExternalUrl(event.registration_url);
  const isCancelled = event.state === "cancelled";
  const isPostponed = event.state === "postponed";
  const showRegistration = Boolean(registration) && !past && !isCancelled && !isPostponed;

  return (
    <article
      data-reveal
      className="group grid gap-6 border-b border-line py-8 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-8"
    >
      {/* Date block — the anchor of the composition */}
      <div className="flex w-16 shrink-0 flex-col items-center border-r border-line pr-6 sm:w-20">
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-purple/85">
          {parts.month}
        </span>
        <span className="display-serif text-[2.4rem] leading-none text-plum">
          {parts.day}
        </span>
        <span className="mt-1 text-[0.58rem] uppercase tracking-[0.18em] text-muted">
          {parts.year}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {isCancelled ? (
            <Tag tone="champagne">Cancelled</Tag>
          ) : isPostponed ? (
            <Tag tone="champagne">Postponed</Tag>
          ) : past ? (
            <Tag tone="neutral">Past event</Tag>
          ) : (
            <Tag>Upcoming</Tag>
          )}
          <span className="text-[0.64rem] uppercase tracking-[0.16em] text-muted">
            {parts.weekday} · {startTime}
            {endTime ? `–${endTime}` : ""}
          </span>
        </div>

        <h3 className="display-serif mt-3 text-[1.6rem] leading-tight text-plum">
          {event.title}
        </h3>

        {event.venue ? (
          <p className="mt-2 text-[0.82rem] uppercase tracking-[0.14em] text-muted">
            {event.venue}
          </p>
        ) : null}

        {event.description ? (
          <p className="mt-3 max-w-[62ch] text-[0.94rem] leading-[1.7] text-charcoal/80">
            {event.description}
          </p>
        ) : null}

        {event.additional_info ? (
          <p className="mt-3 max-w-[62ch] text-[0.82rem] leading-relaxed text-muted">
            {event.additional_info}
          </p>
        ) : null}

        {past && event.recap ? (
          <div className="mt-4 border-l border-champagne pl-4">
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-plum/70">Recap</p>
            <p className="mt-1.5 max-w-[62ch] text-[0.9rem] leading-relaxed text-muted">
              {event.recap}
            </p>
          </div>
        ) : null}
      </div>

      {showRegistration ? (
        <div className="sm:pt-1">
          <a
            href={registration as string}
            target="_blank"
            rel="noopener noreferrer"
            className="link-editorial text-[0.66rem]"
          >
            Register
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}
    </article>
  );
}
