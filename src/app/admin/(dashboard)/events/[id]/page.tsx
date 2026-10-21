import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteEventAction, saveEventAction } from "@/app/admin/actions";
import AdminRecordForm from "@/components/admin/AdminRecordForm";
import SubmitButton from "@/components/admin/SubmitButton";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { adminGetEvent, adminGetSettings } from "@/lib/admin-data";
import { eventFields } from "@/lib/admin-forms";
import { utcToZonedInput } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function EventEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const [event, settings] = await Promise.all([
    isNew ? Promise.resolve(null) : adminGetEvent(id),
    adminGetSettings(),
  ]);

  if (!isNew && !event) notFound();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Events"
        title={isNew ? "New event" : event!.title}
        description={`Times are entered and shown in ${settings.timezone}. Upcoming and past are decided from the real start time.`}
        actions={
          <Link href="/admin/events" className="btn btn-secondary min-h-10 px-4 py-2 text-[0.7rem]">
            All events
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <Card>
          <AdminRecordForm
            action={saveEventAction}
            fields={eventFields()}
            hidden={event ? { id: event.id } : {}}
            values={
              event
                ? {
                    title: event.title,
                    slug: event.slug,
                    description: event.description,
                    startsAt: utcToZonedInput(event.starts_at, settings.timezone),
                    endsAt: utcToZonedInput(event.ends_at, settings.timezone),
                    venue: event.venue,
                    coverImageUrl: event.cover_image_url,
                    coverImageAlt: event.cover_image_alt,
                    registrationUrl: event.registration_url,
                    additionalInfo: event.additional_info,
                    recap: event.recap,
                    state: event.state,
                    isPublished: event.is_published,
                  }
                : { state: "scheduled", isPublished: false }
            }
            submitLabel={isNew ? "Create event" : "Save event"}
          />
        </Card>

        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
              Before publishing
            </h2>
            <ul className="mt-3 grid gap-2.5 text-[0.76rem] leading-relaxed text-admin-muted">
              <li>Confirm the date, time and venue with the venue or college.</li>
              <li>Leave unpublished until confirmations are in hand.</li>
              <li>Use Postponed or Cancelled rather than deleting — students may already have seen it.</li>
              <li>Add a recap afterwards so past events stay useful.</li>
            </ul>
          </Card>

          {event ? (
            <Card>
              <h2 className="text-[0.62rem] uppercase tracking-[0.18em] text-admin-muted">
                Danger zone
              </h2>
              <form action={deleteEventAction} className="mt-3">
                <input type="hidden" name="id" value={event.id} />
                <SubmitButton
                  variant="danger"
                  pendingLabel="Deleting…"
                  confirmMessage={`Delete “${event.title}”? This cannot be undone.`}
                  className="w-full justify-center"
                >
                  Delete event
                </SubmitButton>
              </form>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
