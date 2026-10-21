"use client";

import { useId, useRef, useState } from "react";

import { ArrowRight } from "@/components/ui";
import { cx } from "@/lib/cx";
import { ALL_FEEDBACK_CATEGORIES, FEEDBACK_CATEGORY_LABELS } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

interface FieldErrors {
  [key: string]: string;
}

export default function VoiceForm({ institution }: { institution: string }) {
  const formId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const openedAt = useRef<number>(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setErrors({});
    setMessage("");

    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      category: String(data.get("category") ?? "idea"),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
      elapsedMs: Date.now() - openedAt.current,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: FieldErrors;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrors(result.errors ?? {});
        setMessage(
          result.message ??
            "That did not send. Please check the highlighted fields and try again.",
        );
        const firstField = result.errors ? Object.keys(result.errors)[0] : undefined;
        if (firstField) {
          form.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
        }
        return;
      }

      setStatus("success");
      form.reset();
      openedAt.current = Date.now();
    } catch {
      setStatus("error");
      setMessage(
        "The message could not be sent — this is usually a connection problem. Please try again in a moment.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex flex-col justify-center border border-line bg-paper p-8 md:p-10"
        role="status"
        aria-live="polite"
      >
        <span aria-hidden="true" className="h-px w-16 bg-champagne" />
        <h3 className="display-serif mt-6 text-[2rem] leading-tight text-plum">
          Thank you — this reached the campaign.
        </h3>
        <p className="mt-4 max-w-[44ch] text-[0.95rem] leading-[1.75] text-muted">
          Your message is stored privately and read by the candidate. Nothing you send
          is published without your explicit permission. If you asked for a reply, one
          will come to the contact details you shared.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn btn-secondary mt-8 self-start"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldError = (name: string) =>
    errors[name] ? (
      <p className="field-error" id={`${formId}-${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="border border-line bg-paper p-6 md:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`${formId}-name`}>
            Your name <span className="normal-case tracking-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            className="field-input"
            placeholder="How should the campaign address you?"
            aria-invalid={Boolean(errors.name)}
          />
          {fieldError("name")}
        </div>

        <div>
          <label className="field-label" htmlFor={`${formId}-category`}>
            What is this about?
          </label>
          <select
            id={`${formId}-category`}
            name="category"
            defaultValue="idea"
            className="field-input"
            aria-invalid={Boolean(errors.category)}
          >
            {ALL_FEEDBACK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {FEEDBACK_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          {fieldError("category")}
        </div>

        <div>
          <label className="field-label" htmlFor={`${formId}-email`}>
            Email <span className="normal-case tracking-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={160}
            className="field-input"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          />
          {fieldError("email")}
        </div>

        <div>
          <label className="field-label" htmlFor={`${formId}-phone`}>
            Phone <span className="normal-case tracking-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={40}
            className="field-input"
            placeholder="Only if you prefer a call"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${formId}-phone-error` : undefined}
          />
          {fieldError("phone")}
        </div>
      </div>

      <div className="mt-5">
        <label className="field-label" htmlFor={`${formId}-message`}>
          Your idea, question or concern
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          className={cx("field-input resize-y", errors.message && "border-[#b4574f]")}
          placeholder="Be as specific as you like — what would make campus life better, or what needs an answer?"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? `${formId}-message-error` : `${formId}-message-hint`
          }
        />
        {errors.message ? (
          <p className="field-error" id={`${formId}-message-error`}>
            {errors.message}
          </p>
        ) : (
          <p className="field-hint" id={`${formId}-message-hint`}>
            At least 10 characters. Plain language is perfect.
          </p>
        )}
      </div>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <input
          id={`${formId}-consent`}
          name="consent"
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded-none border-line text-purple accent-[#76639A]"
        />
        <label htmlFor={`${formId}-consent`} className="text-[0.84rem] leading-relaxed text-charcoal/80">
          I would like a response, and I am happy to be contacted about this message.
        </label>
      </div>

      {status === "error" && message ? (
        <p
          role="alert"
          className="mt-5 border-l-2 border-[#b4574f] bg-[#fdf7f6] px-4 py-3 text-sm text-[#96433c]"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[42ch] text-[0.72rem] leading-relaxed text-muted">
          Submissions are private. They are visible only to the campaign
          administrator and are never published without your permission.
        </p>
        <button
          type="submit"
          className="btn btn-primary shrink-0"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send to the campaign"}
          {status === "submitting" ? null : <ArrowRight />}
        </button>
      </div>

      <p className="mt-4 text-[0.7rem] leading-relaxed text-muted/90">
        This form is not a channel for official {institution} grievances or emergencies.
        For those, please use the institution&rsquo;s official processes.
      </p>
    </form>
  );
}
