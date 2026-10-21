import Link from "next/link";

import {
  AdminPageHeader,
  Badge,
  Banner,
  DataTable,
  EmptyState,
  Td,
  Th,
} from "@/components/admin/ui";
import { adminListEvents } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const events = await adminListEvents();
  const now = Date.now();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Campaign"
        title="Events"
        description="Only publish an event once the date, time and venue are confirmed. Unpublished events never appear on the public calendar."
        actions={
          <Link href="/admin/events/new" className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]">
            Add event
          </Link>
        }
      />

      {params.deleted ? <Banner>Event deleted.</Banner> : null}

      {events.length ? (
        <DataTable>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>When</Th>
              <Th>Venue</Th>
              <Th>State</Th>
              <Th>Visibility</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const past = new Date(event.starts_at).getTime() < now;
              return (
                <tr key={event.id} className="hover:bg-ivory/60">
                  <Td>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium text-plum hover:text-purple-700"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-0.5 text-[0.66rem] text-admin-muted">
                      {past ? "Past event" : "Upcoming"}
                    </p>
                  </Td>
                  <Td className="text-[0.78rem] text-charcoal/80">
                    {formatDateTime(event.starts_at)}
                  </Td>
                  <Td className="text-[0.78rem] text-charcoal/80">{event.venue || "—"}</Td>
                  <Td>
                    <Badge status={event.state === "scheduled" ? "published" : "awaiting_approval"} label={event.state} />
                  </Td>
                  <Td>
                    <Badge
                      status={event.is_published ? "published" : "draft"}
                      label={event.is_published ? "Published" : "Unpublished"}
                    />
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-[0.66rem] uppercase tracking-[0.12em] text-purple hover:text-plum"
                      >
                        Edit
                      </Link>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      ) : (
        <EmptyState
          title="No events yet"
          body="When a listening session or campus conversation is confirmed, add it here with the venue and time. The public calendar separates upcoming from past automatically."
          action={
            <Link href="/admin/events/new" className="btn btn-primary">
              Add the first event
            </Link>
          }
        />
      )}
    </div>
  );
}
