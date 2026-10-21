import type { Metadata } from "next";

import PageHeader from "@/components/site/PageHeader";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "What this campaign website collects, why, who can see it, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    heading: "What this website collects",
    body: "Browsing the public site does not require an account and does not create a profile. If you use the Student Voice form, we store the message you write and — only if you choose to provide them — your name, email address and phone number. A one-way hash of your network address is stored alongside the submission solely to prevent spam; the address itself is not recorded.",
  },
  {
    heading: "Why it is collected",
    body: "Submissions exist so the campaign can hear ideas, questions and concerns, and respond where a response has been requested. Recurring themes may be summarised publicly, but summaries report themes and volumes only — never individuals, and never identifiably.",
  },
  {
    heading: "Who can read a submission",
    body: "Only the campaign administrator. The database enforces this: submissions have no public read access at all, so they cannot be listed by a browser or an API client, and administrator access is restricted to one explicitly authorised account.",
  },
  {
    heading: "What is never done",
    body: "Submissions are not published, quoted, attributed or shared without your explicit permission. They are not sold, and they are not used for any purpose beyond running this campaign.",
  },
  {
    heading: "Cookies and analytics",
    body: "The public site sets no advertising or tracking cookies. A session cookie is set only when the administrator signs in to the dashboard. No third-party analytics or advertising scripts are loaded.",
  },
  {
    heading: "Retention and removal",
    body: "Submissions are kept for the duration of the campaign and reviewed periodically. You can ask for a submission to be deleted at any time — include roughly when you sent it and the category you chose, so it can be located.",
  },
  {
    heading: "Your rights",
    body: "You may ask what has been stored about you, request a correction, or request deletion. Contact the campaign through the Student Voice form with the subject of privacy, and the request will be actioned.",
  },
  {
    heading: "Security",
    body: "The site is served over HTTPS. Administrator authentication is handled by Supabase Auth, and every privileged database operation is authorised by row level security policies in Postgres rather than by the interface. Content is validated on the server before it is stored.",
  },
];

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Privacy notice"
        title="What This Site Keeps, And Why."
        intro="A short, plain-language account of the only personal information this campaign collects: what you choose to send through the Student Voice form."
        meta={<span>Last reviewed {new Date().getFullYear()}</span>}
      />

      <section className="bg-paper section-y">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow text-[0.6rem]">On this page</p>
              <ul className="mt-4 grid gap-2">
                {SECTIONS.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#privacy-${index}`}
                      className="text-[0.82rem] leading-relaxed text-muted transition-colors hover:text-plum"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="max-w-[70ch]">
              {SECTIONS.map((section, index) => (
                <section
                  key={section.heading}
                  id={`privacy-${index}`}
                  className="border-t border-line py-8 first:border-t-0 first:pt-0"
                >
                  <h2 className="display-serif text-[1.6rem] leading-snug text-plum">
                    {section.heading}
                  </h2>
                  <p className="mt-3 text-[0.96rem] leading-[1.8] text-charcoal/80">
                    {section.body}
                  </p>
                </section>
              ))}

              <div className="mt-10 border border-line bg-ivory p-6">
                <p className="font-serif text-[1.3rem] leading-snug text-plum">
                  Questions about this notice
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Send them through the Student Voice form and mark the category as
                  &ldquo;Something else&rdquo;.
                  {settings.contact_email ? (
                    <>
                      {" "}
                      You can also write to{" "}
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="text-purple underline decoration-champagne underline-offset-4"
                      >
                        {settings.contact_email}
                      </a>
                      .
                    </>
                  ) : null}
                </p>
              </div>

              <p className="mt-8 text-xs leading-relaxed text-muted">
                This website is a campaign communication and is not operated by{" "}
                {settings.institution}. The institution&rsquo;s own privacy policies
                apply to any official {settings.institution} systems or communications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
