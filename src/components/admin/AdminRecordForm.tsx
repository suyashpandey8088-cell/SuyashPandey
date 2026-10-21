"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import {
  GalleryField,
  ImageField,
  MarkdownField,
  SocialLinksField,
  SlugField,
} from "@/components/admin/fields";
import SubmitButton from "@/components/admin/SubmitButton";
import { Banner } from "@/components/admin/ui";
import { SECTION_KEYS, SECTION_LABELS } from "@/lib/content-defaults";
import type { RecordField } from "@/lib/admin-fields";
import type { AdminAction } from "@/lib/action-state";
import { cx } from "@/lib/cx";

/**
 * One form renderer for every admin entity.
 *
 * Server pages describe their fields declaratively; this component owns the
 * action state, inline errors and the submit affordance. Keeping it in one
 * place means validation feedback behaves identically everywhere.
 */
export default function AdminRecordForm({
  action,
  fields,
  values = {},
  hidden = {},
  submitLabel = "Save changes",
  pendingLabel = "Saving…",
  extraActions,
  footer,
  columns = 2,
}: {
  action: AdminAction;
  fields: RecordField[];
  values?: Record<string, unknown>;
  hidden?: Record<string, string | undefined>;
  submitLabel?: string;
  pendingLabel?: string;
  extraActions?: ReactNode;
  footer?: ReactNode;
  columns?: 1 | 2;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="grid gap-6">
      {Object.entries(hidden).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}

      <div
        className={cx(
          "grid gap-5",
          columns === 2 ? "md:grid-cols-2" : "grid-cols-1",
        )}
      >
        {fields.map((field) => (
          <div
            key={field.name}
            className={cx(field.wide && "md:col-span-2", field.type === "gallery" && "md:col-span-2")}
          >
            <FieldRenderer field={field} values={values} />
          </div>
        ))}
      </div>

      {state?.message ? (
        <Banner tone={state.ok ? "success" : "error"}>{state.message}</Banner>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
        {extraActions}
      </div>

      {footer}
    </form>
  );
}

function FieldRenderer({
  field,
  values,
}: {
  field: RecordField;
  values: Record<string, unknown>;
}) {
  const raw = values[field.name];
  const stringValue = raw === null || raw === undefined ? "" : String(raw);

  switch (field.type) {
    case "markdown":
      return (
        <MarkdownField
          name={field.name}
          label={field.label}
          defaultValue={stringValue}
          rows={field.rows ?? 18}
          hint={field.hint}
        />
      );

    case "image":
      return (
        <ImageField
          name={field.name}
          label={field.label}
          defaultValue={stringValue}
          folder={field.folder ?? "uploads"}
          hint={field.hint}
          optional={field.optional}
        />
      );

    case "gallery":
      return (
        <GalleryField
          name={field.name}
          label={field.label}
          defaultValue={stringValue || "[]"}
        />
      );

    case "social":
      return (
        <SocialLinksField
          name={field.name}
          label={field.label}
          defaultValue={stringValue || "[]"}
        />
      );

    case "slug":
      return (
        <SlugField
          name={field.name}
          label={field.label}
          defaultValue={stringValue}
          sourceField={field.sourceField ?? "title"}
          hint={field.hint}
        />
      );

    case "sections": {
      const sections = (raw ?? {}) as Record<string, boolean>;
      return (
        <fieldset>
          <legend className="field-label">{field.label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SECTION_KEYS.map((key) => (
              <label
                key={key}
                className="flex items-center gap-2.5 border border-line bg-ivory/50 px-3 py-2"
              >
                <input
                  type="checkbox"
                  name={`section_${key}`}
                  defaultChecked={sections[key] !== false}
                  className="h-4 w-4 accent-[#76639A]"
                />
                <span className="text-[0.82rem] text-plum">
                  {SECTION_LABELS[key] ?? key}
                </span>
              </label>
            ))}
          </div>
          <p className="field-hint">
            Unchecking a section hides it from the public homepage without deleting any
            content.
          </p>
        </fieldset>
      );
    }

    case "checkbox":
      return (
        <label className="flex items-start gap-3 border border-line bg-ivory/50 px-3 py-3">
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={Boolean(raw)}
            className="mt-0.5 h-4 w-4 accent-[#76639A]"
          />
          <span>
            <span className="block text-[0.85rem] text-plum">{field.label}</span>
            {field.hint ? (
              <span className="mt-0.5 block text-xs text-admin-muted">{field.hint}</span>
            ) : null}
          </span>
        </label>
      );

    case "select":
      return (
        <div>
          <label className="field-label" htmlFor={`f-${field.name}`}>
            {field.label}
          </label>
          <select
            id={`f-${field.name}`}
            name={field.name}
            defaultValue={stringValue}
            className="field-input"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.hint ? <p className="field-hint">{field.hint}</p> : null}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="field-label" htmlFor={`f-${field.name}`}>
            {field.label}
            {field.optional ? (
              <span className="ml-2 normal-case tracking-normal text-admin-muted">
                optional
              </span>
            ) : null}
          </label>
          <textarea
            id={`f-${field.name}`}
            name={field.name}
            defaultValue={stringValue}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            className="field-input resize-y"
          />
          {field.hint ? <p className="field-hint">{field.hint}</p> : null}
        </div>
      );

    case "number":
      return (
        <div>
          <label className="field-label" htmlFor={`f-${field.name}`}>
            {field.label}
            {field.optional ? (
              <span className="ml-2 normal-case tracking-normal text-admin-muted">
                optional
              </span>
            ) : null}
          </label>
          <input
            id={`f-${field.name}`}
            name={field.name}
            type="number"
            defaultValue={stringValue}
            min={field.min}
            max={field.max}
            className="field-input"
          />
          {field.hint ? <p className="field-hint">{field.hint}</p> : null}
        </div>
      );

    default: {
      const type =
        field.type === "email"
          ? "email"
          : field.type === "url"
            ? "url"
            : field.type === "date"
              ? "date"
              : field.type === "datetime"
                ? "datetime-local"
                : field.type === "password"
                  ? "password"
                  : "text";

      return (
        <div>
          <label className="field-label" htmlFor={`f-${field.name}`}>
            {field.label}
            {field.optional ? (
              <span className="ml-2 normal-case tracking-normal text-admin-muted">
                optional
              </span>
            ) : null}
          </label>
          <input
            id={`f-${field.name}`}
            name={field.name}
            type={type}
            defaultValue={stringValue}
            placeholder={field.placeholder}
            className="field-input"
            autoComplete={field.type === "password" ? "new-password" : "off"}
          />
          {field.hint ? <p className="field-hint">{field.hint}</p> : null}
        </div>
      );
    }
  }
}
