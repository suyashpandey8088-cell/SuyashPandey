import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "@/lib/cx";
import { INITIATIVE_STATUS_LABELS } from "@/lib/types";
import type { InitiativeStatus } from "@/lib/types";

/* ------------------------------------------------------------------ icons */

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cx("h-4 w-4", className)}
    >
      <path
        d="M3 10h13M11 4.5 16.5 10 11 15.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cx("h-4 w-4", className)}
    >
      <path
        d="M6 14 14 6M7 6h7v7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- buttons */

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children" | "className">) {
  return (
    <Link
      href={href}
      className={cx("btn", variant === "primary" ? "btn-primary" : "btn-secondary", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function EditorialLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cx("link-editorial group", className)}>
      {children}
      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/* -------------------------------------------------------------- editorial */

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "h2" | "div";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cx("eyebrow flex items-center gap-3", className)} {...rest}>
      <span aria-hidden="true" className="inline-block h-px w-8 bg-champagne" />
      {children}
    </Tag>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Eyebrow data-reveal className={align === "center" ? "justify-center" : undefined}>
        {eyebrow}
      </Eyebrow>
      <h2
        data-reveal
        className="display-serif text-display text-plum max-w-[22ch]"
      >
        {title}
      </h2>
      {intro ? (
        <div
          data-reveal
          className={cx(
            "text-lead text-muted max-w-[46ch]",
            align === "center" && "mx-auto",
          )}
        >
          {intro}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- status */

const STATUS_TONE: Record<InitiativeStatus, string> = {
  proposed: "tag",
  in_progress: "tag tag-ink",
  awaiting_approval: "tag tag-champagne",
  completed: "tag",
  on_hold: "tag tag-neutral",
};

export function StatusTag({
  status,
  className,
}: {
  status: InitiativeStatus;
  className?: string;
}) {
  return (
    <span className={cx(STATUS_TONE[status] ?? "tag", className)}>
      {INITIATIVE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "neutral" | "champagne" | "ink";
  className?: string;
}) {
  const toneClass =
    tone === "neutral"
      ? "tag-neutral"
      : tone === "champagne"
        ? "tag-champagne"
        : tone === "ink"
          ? "tag-ink"
          : "";
  return <span className={cx("tag", toneClass, className)}>{children}</span>;
}

/* --------------------------------------------------------------- monogram */

export function Monogram({
  text = "SP",
  className,
  size = "md",
}: {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm"
      ? "h-9 w-9 text-[0.7rem]"
      : size === "lg"
        ? "h-16 w-16 text-base"
        : "h-11 w-11 text-xs";
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-champagne/70 font-serif tracking-[0.08em] text-plum",
        dims,
        className,
      )}
    >
      {text}
    </span>
  );
}

/* ------------------------------------------------------------- decorations */

export function Hairline({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("rule-champagne w-full", className)} />;
}
