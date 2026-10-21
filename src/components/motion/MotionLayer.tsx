"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll choreography.
 *
 * Progressive enhancement rules:
 *  - Content is only hidden by CSS while JavaScript is present *and* motion has
 *    not been disabled (see globals.css).
 *  - If the user prefers reduced motion, if GSAP fails to load, or if the boot
 *    failsafe fires, `no-motion` is added and every element is simply visible.
 *  - ScrollTrigger is refreshed after fonts and images settle so reveals never
 *    trigger at the wrong offset.
 */
export default function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      root.classList.add("no-motion", "motion-ready");
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any;

    const boot = async () => {
      try {
        const gsapModule = await import("gsap");
        const scrollTriggerModule = await import("gsap/ScrollTrigger");
        if (cancelled) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gsap = (gsapModule as any).gsap ?? (gsapModule as any).default;
        const ScrollTrigger =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (scrollTriggerModule as any).ScrollTrigger ?? (scrollTriggerModule as any).default;

        gsap.registerPlugin(ScrollTrigger);
        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        ctx = gsap.context(() => {
          /* ---------------------------------------------------- hero ---- */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const heroItems: any[] = Array.from(
            document.querySelectorAll('[data-reveal="hero"]'),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const heroLines: any[] = Array.from(document.querySelectorAll("[data-hero-line]"));

          if (heroItems.length) {
            gsap.set(heroItems, { opacity: 0, y: 22 });
            if (heroLines.length) gsap.set(heroLines, { yPercent: 114 });

            const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (heroLines.length) {
              timeline.to(
                heroLines,
                { yPercent: 0, duration: 1.15, stagger: 0.085 },
                0.05,
              );
            }
            timeline.to(
              heroItems,
              { opacity: 1, y: 0, duration: 0.95, stagger: 0.075 },
              0.1,
            );
          }

          /* ------------------------------------------- scroll reveals -- */
          const reveals = Array.from(document.querySelectorAll("[data-reveal]")).filter(
            (element) => (element as HTMLElement).dataset.reveal !== "hero",
          );

          if (reveals.length) {
            gsap.set(reveals, { opacity: 0, y: isMobile ? 18 : 28 });

            ScrollTrigger.batch(reveals, {
              start: "top 92%",
              once: true,
              interval: 0.08,
              batchMax: 6,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onEnter: (batch: any[]) => {
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  duration: isMobile ? 0.65 : 0.9,
                  stagger: 0.07,
                  ease: "power2.out",
                  overwrite: true,
                });
              },
            });
          }

          /* ---------------------------------------------- clip reveals -- */
          const clips = Array.from(document.querySelectorAll("[data-clip-reveal]"));
          clips.forEach((element) => {
            gsap.fromTo(
              element,
              { clipPath: "inset(0% 0% 100% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.25,
                ease: "power3.inOut",
                scrollTrigger: { trigger: element, start: "top 88%", once: true },
              },
            );
          });

          /* ------------------------------------------------- parallax -- */
          if (!isMobile) {
            const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
            parallaxItems.forEach((element) => {
              const depth = Number((element as HTMLElement).dataset.parallax || 10);
              gsap.fromTo(
                element,
                { yPercent: -depth / 2 },
                {
                  yPercent: depth / 2,
                  ease: "none",
                  scrollTrigger: {
                    trigger: element.parentElement ?? element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            });
          }
        });

        root.classList.add("motion-ready");
        ScrollTrigger.refresh();

        const refresh = () => ScrollTrigger.refresh();
        if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
        window.addEventListener("load", refresh, { once: true });
      } catch {
        root.classList.add("no-motion");
      }
    };

    void boot();

    return () => {
      cancelled = true;
      try {
        ctx?.revert();
      } catch {
        /* noop */
      }
    };
  }, [pathname]);

  return null;
}
