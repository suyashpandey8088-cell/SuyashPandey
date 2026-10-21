"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { uploadImageAction } from "@/app/admin/actions";
import { cx } from "@/lib/cx";
import { slugify } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

/* -------------------------------------------------------------- image field */

export function ImageField({
  name,
  label,
  defaultValue,
  folder = "uploads",
  hint,
  aspect = "aspect-[4/3]",
  optional,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
  hint?: string;
  aspect?: string;
  optional?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    const result = await uploadImageAction(formData);
    setBusy(false);
    if (result.ok && result.url) setUrl(result.url);
    else setError(result.error ?? "That image could not be uploaded.");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <span className="field-label">
        {label}
        {optional ? (
          <span className="ml-2 normal-case tracking-normal text-admin-muted">optional</span>
        ) : null}
      </span>

      <input type="hidden" name={name} value={url} />

      <div className="flex flex-wrap items-start gap-4">
        <div
          className={cx(
            "relative w-36 shrink-0 overflow-hidden border border-line bg-ivory",
            aspect,
          )}
        >
          {url ? (
            <Image src={url} alt="" fill sizes="144px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[0.6rem] uppercase tracking-[0.16em] text-admin-muted">
              No image
            </div>
          )}
        </div>

        <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="border border-line bg-white px-3 py-2 text-[0.68rem] uppercase tracking-[0.1em] text-plum transition-colors hover:border-purple/50 disabled:opacity-60"
            >
              {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
            </button>
            {url ? (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="px-3 py-2 text-[0.68rem] uppercase tracking-[0.1em] text-[#96433c] hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="or paste an image URL"
            className="field-input text-xs"
            aria-label={`${label} URL`}
          />

          {error ? <p className="field-error">{error}</p> : null}
          {hint ? <p className="field-hint">{hint}</p> : null}
          <p className="text-[0.66rem] text-admin-muted">
            JPEG, PNG, WebP or AVIF · up to 8 MB
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ gallery field */

interface GalleryImage {
  url: string;
  alt: string;
}

export function GalleryField({
  name,
  label,
  defaultValue = "[]",
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const initial = (() => {
    try {
      const parsed = JSON.parse(defaultValue || "[]");
      return Array.isArray(parsed) ? (parsed as GalleryImage[]) : [];
    } catch {
      return [];
    }
  })();

  const [images, setImages] = useState<GalleryImage[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const next: GalleryImage[] = [];
    for (const file of Array.from(files).slice(0, 6)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "gallery");
      const result = await uploadImageAction(formData);
      if (result.ok && result.url) next.push({ url: result.url, alt: "" });
      else setError(result.error ?? "An image could not be uploaded.");
    }
    setImages((current) => [...current, ...next].slice(0, 12));
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="grid gap-3">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="flex flex-wrap items-center gap-3 border border-line bg-ivory/60 p-2"
          >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden border border-line bg-white">
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <input
              value={image.alt}
              onChange={(event) =>
                setImages((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, alt: event.target.value } : item,
                  ),
                )
              }
              placeholder="Alternative text (describe the image)"
              className="field-input min-w-[10rem] flex-1 text-xs"
              aria-label={`Alternative text for gallery image ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
              className="px-2 py-1 text-[0.66rem] uppercase tracking-[0.1em] text-[#96433c] hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy || images.length >= 12}
          className="border border-line bg-white px-3 py-2 text-[0.68rem] uppercase tracking-[0.1em] text-plum transition-colors hover:border-purple/50 disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Add gallery images"}
        </button>
        <span className="text-[0.66rem] text-admin-muted">
          {images.length} of 12 · alternative text is required for accessibility
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => void addFiles(event.target.files)}
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

/* --------------------------------------------------------------- slug field */

export function SlugField({
  name,
  label,
  defaultValue = "",
  sourceField = "title",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  sourceField?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  function generate() {
    const form = inputRef.current?.form;
    const source = form?.querySelector<HTMLInputElement>(`[name="${sourceField}"]`);
    if (!source?.value) return;
    setValue(slugify(source.value));
  }

  return (
    <div>
      <label className="field-label" htmlFor={`slug-${name}`}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={`slug-${name}`}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className="field-input font-mono text-xs"
        />
        <button
          type="button"
          onClick={generate}
          className="shrink-0 border border-line bg-white px-3 text-[0.66rem] uppercase tracking-[0.1em] text-plum transition-colors hover:border-purple/50"
        >
          From title
        </button>
      </div>
      <p className="field-hint">{hint ?? "Used in the public URL: /updates/your-slug"}</p>
    </div>
  );
}

/* ---------------------------------------------------------- markdown editor */

export function MarkdownField({
  name,
  label,
  defaultValue = "",
  rows = 18,
  hint,
  id,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="field-label mb-0">{label}</span>
        <div className="flex gap-1" role="tablist" aria-label="Editor mode">
          {(["write", "preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={tab === mode}
              onClick={() => setTab(mode)}
              className={cx(
                "border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.1em] transition-colors",
                tab === mode
                  ? "border-plum bg-plum text-white"
                  : "border-line bg-white text-admin-muted hover:text-plum",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={rows}
          className="field-input font-mono text-[0.82rem] leading-relaxed"
          placeholder={"## A heading\n\nSome **bold** text, a [link](https://example.com), and a list:\n\n- First point\n- Second point"}
        />
      ) : (
        <>
          <input type="hidden" name={name} value={value} />
          <div
            className="prose-campaign max-h-[28rem] overflow-y-auto border border-line bg-ivory/50 p-5"
            // renderMarkdown escapes all HTML before formatting, so this is safe.
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(value) || "<p class='text-admin-muted'>Nothing to preview yet.</p>",
            }}
          />
        </>
      )}

      <p className="field-hint">
        {hint ??
          "Markdown: ## heading, **bold**, *italic*, [link](https://…), - list, > quote. Raw HTML is escaped, never executed."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------- social link field */

interface SocialLink {
  label: string;
  url: string;
}

export function SocialLinksField({
  name,
  label,
  defaultValue = "[]",
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  const initial = (() => {
    try {
      const parsed = JSON.parse(defaultValue || "[]");
      return Array.isArray(parsed) ? (parsed as SocialLink[]) : [];
    } catch {
      return [];
    }
  })();

  const [links, setLinks] = useState<SocialLink[]>(initial);

  return (
    <div>
      <span className="field-label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(links)} />
      <div className="grid gap-2">
        {links.map((link, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <input
              value={link.label}
              onChange={(event) =>
                setLinks((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, label: event.target.value } : item,
                  ),
                )
              }
              placeholder="Label (Instagram)"
              className="field-input w-40 text-xs"
              aria-label={`Link ${index + 1} label`}
            />
            <input
              value={link.url}
              onChange={(event) =>
                setLinks((current) =>
                  current.map((item, i) =>
                    i === index ? { ...item, url: event.target.value } : item,
                  ),
                )
              }
              placeholder="https://instagram.com/…"
              className="field-input min-w-[12rem] flex-1 text-xs"
              aria-label={`Link ${index + 1} URL`}
            />
            <button
              type="button"
              onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
              className="px-2 text-[0.66rem] uppercase tracking-[0.1em] text-[#96433c] hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setLinks((current) => [...current, { label: "", url: "" }].slice(0, 8))}
        className="mt-3 border border-line bg-white px-3 py-2 text-[0.68rem] uppercase tracking-[0.1em] text-plum transition-colors hover:border-purple/50"
      >
        Add a link
      </button>
      <p className="field-hint">
        Only links beginning with https:// are published. Empty rows are ignored.
      </p>
    </div>
  );
}
