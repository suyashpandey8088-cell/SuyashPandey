/**
 * A deliberately small Markdown renderer.
 *
 * Campaign content is authored by the administrator, but rendered HTML is still
 * treated as untrusted: the entire source is HTML-escaped *first*, and only a
 * fixed subset of Markdown syntax is converted back into markup. That makes
 * script injection through the editor structurally impossible rather than
 * dependent on a sanitizer allow-list staying correct.
 *
 * Supported: paragraphs, ## headings, **bold**, *italic*, `code`,
 * [links](https://…), unordered + ordered lists, blockquotes, horizontal rules.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeHref(href: string): boolean {
  if (href.startsWith("/") || href.startsWith("#")) return true;
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
}

function renderInline(raw: string): string {
  let text = raw;

  // Links first, so their bracket syntax is not consumed by emphasis rules.
  text = text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      if (!isSafeHref(href)) return label;
      const external = /^https?:\/\//i.test(href);
      const attrs = external
        ? ' target="_blank" rel="noopener noreferrer nofollow"'
        : "";
      return `<a href="${href}"${attrs}>${label}</a>`;
    },
  );

  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");

  return text;
}

export function renderMarkdown(source: string | null | undefined): string {
  const escaped = escapeHtml((source || "").replace(/\r\n/g, "\n"));
  const lines = escaped.split("\n");
  const out: string[] = [];

  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      out.push(`<blockquote><p>${renderInline(quote.join(" "))}</p></blockquote>`);
      quote = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushAll();
      const level = Math.min(4, Math.max(2, heading[1].length));
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushAll();
      out.push("<hr />");
      continue;
    }

    const quoteLine = /^&gt;\s?(.*)$/.exec(trimmed);
    if (quoteLine) {
      flushParagraph();
      flushList();
      quote.push(quoteLine[1]);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    const numbered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (bullet || numbered) {
      flushParagraph();
      flushQuote();
      const nextType = bullet ? "ul" : "ol";
      if (listType !== nextType) {
        flushList();
        out.push(`<${nextType}>`);
        listType = nextType;
      }
      out.push(`<li>${renderInline((bullet ?? numbered)![1])}</li>`);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushAll();
  return out.join("\n");
}

/** Plain text preview for search results / meta descriptions. */
export function markdownToPlain(source: string | null | undefined, max = 200): string {
  const text = (source || "")
    .replace(/`{1,3}/g, "")
    .replace(/[*_>#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
