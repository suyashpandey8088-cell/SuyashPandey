"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { cx } from "@/lib/cx";

interface NavItem {
  label: string;
  href: string;
  match?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Vision", href: "/#vision" },
  { label: "Manifesto", href: "/manifesto", match: "/manifesto" },
  { label: "Updates", href: "/updates", match: "/updates" },
  { label: "Events", href: "/events", match: "/events" },
  { label: "Student Voice", href: "/#voice" },
];

export default function Navbar({
  candidateName,
  monogram,
  ctaLabel = "Explore the Vision",
}: {
  candidateName: string;
  monogram: string;
  ctaLabel?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Scroll state + reading progress, batched into one rAF-throttled listener */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(top > 16);
      setProgress(height > 0 ? Math.min(1, Math.max(0, top / height)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Close the mobile panel on navigation */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Escape to close + scroll lock + return focus */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = useCallback(
    (item: NavItem) => (item.match ? pathname === item.match || pathname.startsWith(`${item.match}/`) : false),
    [pathname],
  );

  return (
    <>
      {/* Reading progress — deliberately thin and quiet */}
      <div
        aria-hidden="true"
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />

      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-line bg-ivory/92 shadow-[0_1px_24px_-12px_rgba(68,52,81,0.35)] backdrop-blur-[6px]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
          <Link
            href="/"
            className="group flex items-center gap-3.5 focus-visible:outline-offset-8"
            aria-label={`${candidateName} — home`}
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/80 font-serif text-[0.7rem] tracking-[0.1em] text-plum transition-colors duration-500 group-hover:border-purple/60 group-hover:bg-lavender-50"
            >
              {monogram}
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[0.82rem] font-medium uppercase tracking-[0.28em] text-plum">
                {candidateName}
              </span>
              <span className="mt-1.5 text-[0.58rem] uppercase tracking-[0.3em] text-muted">
                For Student Council President
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={cx(
                  "relative py-2 text-[0.8rem] tracking-[0.02em] text-charcoal/80 transition-colors duration-300 hover:text-plum",
                  isActive(item) && "text-plum",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-purple transition-transform duration-300",
                    isActive(item) ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            ))}
            <Link href="/#vision" className="btn btn-primary ml-2 min-h-10 px-5 py-2.5 text-[0.68rem]">
              {ctaLabel}
            </Link>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong/70 text-plum transition-colors hover:border-purple/50 lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span
                className={cx(
                  "absolute left-0 h-px w-full bg-current transition-all duration-300",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cx(
                  "absolute left-0 h-px w-full bg-current transition-all duration-300",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className={cx(
          "fixed inset-0 z-40 flex flex-col bg-ivory pt-[4.5rem] lg:hidden",
          open && "animate-[menu-in_320ms_cubic-bezier(0.22,1,0.36,1)]",
        )}
      >
        <div className="shell flex-1 overflow-y-auto py-10">
          <p className="eyebrow mb-8">Menu</p>
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline justify-between border-b border-line/80 py-4"
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                <span className="font-serif text-[1.75rem] leading-tight text-plum">
                  {item.label}
                </span>
                <span className="text-[0.62rem] tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </nav>
          <Link
            href="/#vision"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-10 w-full"
          >
            {ctaLabel}
          </Link>
          <p className="mt-8 max-w-[34ch] text-sm leading-relaxed text-muted">
            This is a campaign website. It is not an official NIAT communication channel.
          </p>
        </div>
      </div>
    </>
  );
}
