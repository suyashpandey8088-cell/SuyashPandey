import Link from "next/link";

import { safeExternalUrl } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Vision", href: "/#vision" },
  { label: "Manifesto", href: "/manifesto" },
  { label: "Updates", href: "/updates" },
  { label: "Events", href: "/events" },
  { label: "Student Voice", href: "/#voice" },
];

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const socials = settings.social_links
    .map((link) => ({ ...link, href: safeExternalUrl(link.url) }))
    .filter((link): link is { label: string; url: string; href: string } => Boolean(link.href));

  return (
    <footer className="border-t border-line bg-ivory">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          {/* Wordmark */}
          <div>
            <p className="text-[0.86rem] font-medium uppercase tracking-[0.3em] text-plum">
              {settings.candidate_name}
            </p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-muted">
              {settings.position_label} · {settings.institution}
            </p>
            <p className="mt-6 max-w-[34ch] font-serif text-[1.35rem] leading-snug text-plum/90">
              {settings.campaign_slogan}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow mb-5">Campaign</p>
            <ul className="grid gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-plum"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-5">Reach the campaign</p>
            <ul className="grid gap-2.5">
              {settings.contact_email ? (
                <li>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm text-muted transition-colors hover:text-plum"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              ) : (
                <li>
                  <Link
                    href="/#voice"
                    className="text-sm text-muted transition-colors hover:text-plum"
                  >
                    Share an idea or concern
                  </Link>
                </li>
              )}
              {socials.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted transition-colors hover:text-plum"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted transition-colors hover:text-plum"
                >
                  Privacy notice
                </Link>
              </li>
            </ul>
            {settings.contact_note ? (
              <p className="mt-4 max-w-[30ch] text-xs leading-relaxed text-muted/90">
                {settings.contact_note}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="max-w-[74ch] text-xs leading-relaxed text-muted">
            <span className="font-medium text-plum/80">Campaign communication: </span>
            This website is run by the {settings.candidate_name} student council
            campaign. It is not an official {settings.institution} website and does not
            represent the institution. Official {settings.institution} communications and
            the official election process remain authoritative. Every initiative
            described here is a proposal unless explicitly stated otherwise.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {settings.candidate_name}. All rights reserved.
            </p>
            <p className="flex items-center gap-4">
              <Link href="/privacy" className="transition-colors hover:text-plum">
                Privacy
              </Link>
              <span aria-hidden="true" className="text-champagne">
                ·
              </span>
              <Link href="/admin" className="transition-colors hover:text-plum">
                Campaign admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
