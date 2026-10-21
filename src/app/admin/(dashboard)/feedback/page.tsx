import Link from "next/link";

import {
  deleteFeedbackAction,
  saveFeedbackNoteAction,
  updateFeedbackAction,
} from "@/app/admin/actions";
import SubmitButton from "@/components/admin/SubmitButton";
import {
  AdminPageHeader,
  Badge,
  Banner,
  Card,
  EmptyState,
} from "@/components/admin/ui";
import { adminListFeedback } from "@/lib/admin-data";
import { cx } from "@/lib/cx";
import { formatDateTime, relativeToNow } from "@/lib/format";
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATE_LABELS } from "@/lib/types";
import type { FeedbackState } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { value: FeedbackState | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

export default async function FeedbackInboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const stateParam = Array.isArray(params.state) ? params.state[0] : params.state;
  const state = TABS.some((tab) => tab.value === stateParam)
    ? (stateParam as FeedbackState | "all")
    : "all";

  const submissions = await adminListFeedback(state === "all" ? undefined : state);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Student voice"
        title="Private inbox"
        description="Submissions from the public form. These are private: they are never shown on the site, and row level security prevents anyone but the campaign administrator from reading them."
      />

      <Banner tone="info">
        Publish only themes, never people. Nothing here may be quoted or attributed
        without the sender&rsquo;s explicit permission.
      </Banner>

      <nav aria-label="Filter submissions" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/feedback" : `/admin/feedback?state=${tab.value}`}
            aria-current={state === tab.value ? "page" : undefined}
            className={cx(
              "border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors",
              state === tab.value
                ? "border-plum bg-plum text-white"
                : "border-line bg-white text-admin-muted hover:border-purple/40 hover:text-plum",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {submissions.length ? (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge status={submission.state} label={FEEDBACK_STATE_LABELS[submission.state]} />
                  <span className="text-[0.66rem] uppercase tracking-[0.14em] text-admin-muted">
                    {FEEDBACK_CATEGORY_LABELS[submission.category] ?? submission.category}
                  </span>
                  <span className="text-[0.66rem] text-admin-muted">
                    {relativeToNow(submission.created_at)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {submission.state !== "read" && submission.state !== "replied" ? (
                    <form action={updateFeedbackAction}>
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="state" value="read" />
                      <SubmitButton variant="secondary" pendingLabel="…" className="min-h-8 px-3 py-1 text-[0.62rem]">
                        Mark read
                      </SubmitButton>
                    </form>
                  ) : null}
                  {submission.state !== "replied" ? (
                    <form action={updateFeedbackAction}>
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="state" value="replied" />
                      <SubmitButton variant="secondary" pendingLabel="…" className="min-h-8 px-3 py-1 text-[0.62rem]">
                        Mark replied
                      </SubmitButton>
                    </form>
                  ) : null}
                  {submission.state !== "archived" ? (
                    <form action={updateFeedbackAction}>
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="state" value="archived" />
                      <SubmitButton variant="quiet" pendingLabel="…" className="min-h-8 px-2 py-1 text-[0.62rem]">
                        Archive
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-[0.94rem] leading-[1.75] text-charcoal/90">
                {submission.message}
              </p>

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-3 text-[0.74rem]">
                <div>
                  <dt className="inline text-admin-muted">From · </dt>
                  <dd className="inline text-charcoal/85">{submission.name || "Anonymous"}</dd>
                </div>
                {submission.email ? (
                  <div>
                    <dt className="inline text-admin-muted">Email · </dt>
                    <dd className="inline">
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-purple hover:text-plum"
                      >
                        {submission.email}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {submission.phone ? (
                  <div>
                    <dt className="inline text-admin-muted">Phone · </dt>
                    <dd className="inline text-charcoal/85">{submission.phone}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="inline text-admin-muted">Reply requested · </dt>
                  <dd className="inline text-charcoal/85">{submission.consent ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="inline text-admin-muted">Received · </dt>
                  <dd className="inline text-charcoal/85">
                    {formatDateTime(submission.created_at)}
                  </dd>
                </div>
              </dl>

              <details className="mt-3 border-t border-line pt-3">
                <summary className="cursor-pointer text-[0.66rem] uppercase tracking-[0.14em] text-admin-muted hover:text-plum">
                  Private notes
                </summary>
                <form action={saveFeedbackNoteAction} className="mt-3 grid gap-2">
                  <input type="hidden" name="id" value={submission.id} />
                  <textarea
                    name="adminNotes"
                    defaultValue={submission.admin_notes ?? ""}
                    rows={3}
                    className="field-input text-sm"
                    placeholder="What happened next? Who is following up?"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <SubmitButton variant="secondary" pendingLabel="Saving…" className="min-h-8 px-3 py-1 text-[0.62rem]">
                      Save note
                    </SubmitButton>
                    <span className="text-[0.66rem] text-admin-muted">
                      Notes are private and never shown publicly.
                    </span>
                  </div>
                </form>

                <form action={deleteFeedbackAction} className="mt-3">
                  <input type="hidden" name="id" value={submission.id} />
                  <SubmitButton
                    variant="danger"
                    pendingLabel="Deleting…"
                    className="min-h-8 px-3 py-1 text-[0.62rem]"
                    confirmMessage="Delete this submission permanently? The sender will not be told."
                  >
                    Delete submission
                  </SubmitButton>
                </form>
              </details>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={state === "all" ? "No submissions yet" : `No ${state} submissions`}
          body="Messages sent through the Student Voice form arrive here. They are stored privately and are only visible to you."
          action={
            <Link href="/#voice" target="_blank" className="btn btn-secondary">
              Open the public form ↗
            </Link>
          }
        />
      )}
    </div>
  );
}
