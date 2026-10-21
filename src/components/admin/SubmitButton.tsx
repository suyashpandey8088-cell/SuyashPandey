"use client";

import { useFormStatus } from "react-dom";

import { cx } from "@/lib/cx";

export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className,
  name,
  value,
  onClick,
  confirmMessage,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "quiet";
  className?: string;
  name?: string;
  value?: string;
  onClick?: () => void;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  const variantClass =
    variant === "danger"
      ? "border border-[#c4736b] bg-[#fdf7f6] text-[#96433c] hover:bg-[#f8e9e7]"
      : variant === "secondary"
        ? "border border-line bg-white text-plum hover:border-purple/50 hover:bg-lavender-50"
        : variant === "quiet"
          ? "border border-transparent bg-transparent text-muted hover:text-plum"
          : "border border-purple bg-purple text-white hover:bg-plum hover:border-plum";

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }
        onClick?.();
      }}
      className={cx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-sm px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        variantClass,
        className,
      )}
      aria-busy={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
