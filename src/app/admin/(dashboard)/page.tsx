import Link from "next/link";

import {
  AdminPageHeader,
  Badge,
  Banner,
  Card,
  StatCard,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { adminDashboard } from "@/lib/admin-data";
import { excerpt, formatDateTime, relativeToNow } from "@/lib/format";
import { FEEDBACK_CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await adminDashboard();

  const quickActions = [
    { label: "New update", href: "/admin/updates/new", hint: "Publish an announcement" },
    { label: "Add an event", href: "/admin/events/new", hint: "Confirmed details only" },
    { label: "Edit manifesto", href: "/admin/manifesto", hint: "Six proposals" },
    { label: "Update progress", href: "/admin/progress", hint: "Keep statuses honest" },
  ];

  return (
    <div className="grid gap-8">
      <AdminPageHeader
        eyebrow="Overview"
        title={`Good to see you, ${admin.displayName.split(" ")[0]}.`}
        description="Everything on the public campaign site is managed from here. Published changes appear immediately — no rebuild, no deployment."
        actions={
          <Link href="/admin/updates/new" className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]">
            New update
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Published updates"
          value={stats.published}
          href="/admin/updates?status=published"
          hint="Live on the public site"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          href="/admin/updates?status=draft"
          hint="Not visible publicly"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          href="/admin/updates?status=scheduled"
          tone="accent"
          hint="Publishes automatically"
        />
        <StatCard
          label="Upcoming events"
          value={stats.upcomingEvents}
          href="/admin/events"
          hint="Confirmed and published"
        />
        <StatCard
          label="New submissions"
          value={stats.newFeedback}
          href="/admin/feedback"
          tone={stats.newFeedback > 0 ? "warn" : "default"}
          hint="Student voice inbox"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-xl text-plum">Recently modified</h2>
            <Link
              href="/admin/updates"
              className="text-[0.64rem] uppercase tracking-[0.14em] text-admin-muted hover:text-plum"
            >
              All updates
            </Link>
          </div>

          {stats.recent.length ? (
            <ul className="mt-4 divide-y divide-line">
              {stats.recent.map((item) => (
                <li key={item.href} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="block truncate text-[0.92rem] text-plum hover:text-purple-700"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-[0.68rem] text-admin-muted">
                      Edited {relativeToNow(item.updatedAt)}
                    </p>
                  </div>
                  <Badge status={item.type} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-admin-muted">
              Nothing published yet. Start with a short announcement — it takes a minute.
            </p>
          )}
        </Card>

        <div className="grid gap-4">
          <Card>
            <h2 className="font-serif text-xl text-plum">Quick actions</h2>
            <ul className="mt-4 grid gap-2">
              {quickActions.map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="flex items-center justify-between gap-3 rounded-sm border border-line px-3.5 py-2.5 transition-colors hover:border-purple/40 hover:bg-lavender-50/60"
                  >
                    <span>
                      <span className="block text-[0.86rem] text-plum">{action.label}</span>
                      <span className="block text-[0.66rem] text-admin-muted">{action.hint}</span>
                    </span>
                    <span aria-hidden="true" className="text-champagne">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="font-serif text-xl text-plum">Scheduling</h2>
            {stats.scheduled > 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-admin-muted">
                {stats.scheduled} update{stats.scheduled === 1 ? "" : "s"} waiting to
                publish. A server-side job promotes them at the scheduled time, whether or
                not this tab is open.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-admin-muted">
                Nothing scheduled. Schedule a post from the editor and it will publish
                server-side at the chosen time.
              </p>
            )}
            <Link
              href="/admin/updates?status=scheduled"
              className="mt-3 inline-block text-[0.64rem] uppercase tracking-[0.14em] text-purple hover:text-plum"
            >
              Review the schedule →
            </Link>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-xl text-plum">Latest student voice</h2>
          {stats.latestFeedback ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge status={stats.latestFeedback.state} />
                <span className="text-[0.66rem] uppercase tracking-[0.14em] text-admin-muted">
                  {FEEDBACK_CATEGORY_LABELS[stats.latestFeedback.category] ??
                    stats.latestFeedback.category}
                </span>
              </div>
              <p className="mt-2.5 text-[0.9rem] leading-relaxed text-charcoal/85">
                {excerpt(stats.latestFeedback.message, 220)}
              </p>
              <p className="mt-2 text-[0.66rem] text-admin-muted">
                {stats.latestFeedback.name || "Anonymous"} ·{" "}
                {formatDateTime(stats.latestFeedback.created_at)}
              </p>
              <Link
                href="/admin/feedback"
                className="mt-3 inline-block text-[0.64rem] uppercase tracking-[0.14em] text-purple hover:text-plum"
              >
                Open the inbox →
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm leading-relaxed text-admin-muted">
                No submissions yet. The form at the bottom of the public site delivers
                messages straight to this inbox.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-serif text-xl text-plum">Next event</h2>
          {stats.nextEvent ? (
            <div className="mt-3">
              <p className="text-[0.92rem] text-plum">{stats.nextEvent.title}</p>
              <p className="mt-1 text-[0.72rem] text-admin-muted">
                {formatDateTime(stats.nextEvent.starts_at)} ·{" "}
                {stats.nextEvent.venue || "Venue to be added"}
              </p>
              <Link
                href={`/admin/events/${stats.nextEvent.id}`}
                className="mt-3 inline-block text-[0.64rem] uppercase tracking-[0.14em] text-purple hover:text-plum"
              >
                Edit event →
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-admin-muted">
              No published upcoming events. Add one when a date and venue are confirmed.
            </p>
          )}
        </Card>
      </div>

      {stats.audit.length ? (
        <Card>
          <h2 className="font-serif text-xl text-plum">Recent activity</h2>
          <ul className="mt-3 divide-y divide-line">
            {stats.audit.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[0.78rem]"
              >
                <span className="text-charcoal/80">
                  <span className="font-medium text-plum">{entry.action}</span>{" "}
                  <span className="text-admin-muted">· {entry.entity}</span>
                </span>
                <span className="text-[0.66rem] text-admin-muted">
                  {relativeToNow(entry.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Banner tone="info">
        <strong className="font-medium">A note on security.</strong> This dashboard is
        protected by Supabase Auth and by row level security policies in Postgres. Even
        if someone obtained a session for a different account, the database would refuse
        every write — administrator rights live in an allow-list table that no client can
        modify.
      </Banner>
    </div>
  );
}
