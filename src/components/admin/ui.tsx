import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

/* --------------------------------------------------------------- headings */

export function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-purple">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 font-serif text-[2rem] leading-tight text-plum">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-admin-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ cards */

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-sm border border-line bg-white",
        padded && "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  tone?: "default" | "accent" | "warn";
}) {
  const body = (
    <>
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">{label}</p>
      <p
        className={cx(
          "mt-2 font-serif text-[2.2rem] leading-none",
          tone === "accent" ? "text-purple" : tone === "warn" ? "text-[#a4662f]" : "text-plum",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-admin-muted">{hint}</p> : null}
    </>
  );

  const className =
    "block rounded-sm border border-line bg-white p-5 transition-colors hover:border-purple/40";

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/* ----------------------------------------------------------------- badges */

const CONTENT_TONE: Record<string, string> = {
  published: "border-[#b6cbb2] bg-[#f1f7ef] text-[#3f6b3a]",
  draft: "border-line bg-ivory text-admin-muted",
  scheduled: "border-[#c9bfe0] bg-lavender-50 text-purple-900",
  archived: "border-line bg-[#f4f2ef] text-admin-muted",
  new: "border-[#c9bfe0] bg-lavender-50 text-purple-900",
  read: "border-line bg-ivory text-admin-muted",
  replied: "border-[#b6cbb2] bg-[#f1f7ef] text-[#3f6b3a]",
  in_progress: "border-[#c9bfe0] bg-lavender-50 text-purple-900",
  proposed: "border-line bg-ivory text-plum",
  awaiting_approval: "border-champagne bg-[#fbf6ee] text-[#7a6244]",
  completed: "border-[#b6cbb2] bg-[#f1f7ef] text-[#3f6b3a]",
  on_hold: "border-line bg-[#f4f2ef] text-admin-muted",
};

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em]",
        CONTENT_TONE[status] ?? "border-line bg-ivory text-admin-muted",
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

/* ----------------------------------------------------------------- fields */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  optional,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {optional ? (
          <span className="ml-2 normal-case tracking-normal text-admin-muted">optional</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="field-error">{error}</p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("field-input", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx("field-input", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx("field-input", props.className)} />;
}

export function Checkbox({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#76639A]"
      />
      <span>
        <span className="block text-[0.85rem] leading-snug text-plum">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-admin-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ---------------------------------------------------------------- banners */

export function Banner({
  tone = "success",
  children,
}: {
  tone?: "success" | "error" | "info";
  children: ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-[#dcb3ad] bg-[#fdf7f6] text-[#96433c]"
      : tone === "info"
        ? "border-line bg-ivory text-admin-muted"
        : "border-[#b6cbb2] bg-[#f1f7ef] text-[#3f6b3a]";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx("rounded-sm border px-4 py-3 text-sm leading-relaxed", toneClass)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- empty state */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-line-strong bg-ivory px-6 py-14 text-center">
      <p className="font-serif text-xl text-plum">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-admin-muted">
        {body}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ table */

export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-line bg-white">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cx(
        "border-b border-line px-4 py-3 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-admin-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cx("border-b border-line/70 px-4 py-3 align-middle", className)}>
      {children}
    </td>
  );
}
