import Link from "next/link";

import VoiceForm from "@/components/site/VoiceForm";
import { Eyebrow } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";

const PRINCIPLES = [
  {
    title: "Private by default",
    body: "Your message is stored securely and read only by the campaign administrator. It is never posted publicly.",
  },
  {
    title: "Consent, not assumption",
    body: "Nothing you send is shared or quoted without your explicit permission — even anonymously.",
  },
  {
    title: "An answer, where possible",
    body: "If you leave contact details and ask for a reply, the campaign will respond. Themes raised are summarised, never attributed.",
  },
];

export default function Voice({ settings }: { settings: SiteSettings }) {
  return (
    <section id="voice" aria-labelledby="voice-heading" className="bg-ivory section-y">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Eyebrow data-reveal>Student voice</Eyebrow>
            <h2
              id="voice-heading"
              data-reveal
              className="display-serif mt-7 max-w-[15ch] text-display text-plum"
            >
              Your Ideas Belong Here.
            </h2>
            <p data-reveal className="mt-6 max-w-[46ch] text-lead text-muted">
              A suggestion, a question, a frustration, something that would make your
              day on campus easier — this is the channel. It goes directly to the
              campaign, not into a group chat.
            </p>

            <ul className="mt-10 grid gap-6 border-t border-line pt-8">
              {PRINCIPLES.map((principle) => (
                <li key={principle.title} data-reveal>
                  <h3 className="text-[0.7rem] uppercase tracking-[0.18em] text-purple/90">
                    {principle.title}
                  </h3>
                  <p className="mt-2 max-w-[44ch] text-[0.9rem] leading-relaxed text-muted">
                    {principle.body}
                  </p>
                </li>
              ))}
            </ul>

            <p data-reveal className="mt-8 text-xs leading-relaxed text-muted">
              Read the full{" "}
              <Link
                href="/privacy"
                className="text-purple underline decoration-champagne underline-offset-4 hover:text-plum"
              >
                privacy notice
              </Link>{" "}
              for how submissions are stored, who can read them, and how to have one
              removed.
            </p>
          </div>

          <div data-reveal>
            <VoiceForm institution={settings.institution} />
          </div>
        </div>
      </div>
    </section>
  );
}
