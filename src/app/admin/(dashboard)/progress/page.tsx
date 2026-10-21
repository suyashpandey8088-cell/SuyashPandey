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
import { adminListProgress } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProgressPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const items = await adminListProgress();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Campaign"
        title="Progress board"
        description="The public accountability record. Every change here is visible immediately, with a last-updated date. Only add a percentage when there is something real to measure."
        actions={
          <Link href="/admin/progress/new" className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]">
            Add entry
          </Link>
        }
      />

      {params.deleted ? <Banner>Progress entry deleted.</Banner> : null}

      {items.length ? (
        <DataTable>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Initiative</Th>
              <Th>Status</Th>
              <Th>Percent</Th>
              <Th>Visible</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-ivory/60">
                <Td className="w-16 font-mono text-[0.72rem] text-admin-muted">
                  {String(item.display_order).padStart(2, "0")}
                </Td>
                <Td>
                  <Link
                    href={`/admin/progress/${item.id}`}
                    className="font-medium text-plum hover:text-purple-700"
                  >
                    {item.initiative_name}
                  </Link>
                </Td>
                <Td>
                  <Badge status={item.status} />
                </Td>
                <Td className="text-[0.78rem] text-charcoal/80">
                  {item.percent === null ? "—" : `${item.percent}%`}
                </Td>
                <Td className="text-[0.74rem] text-admin-muted">
                  {item.is_visible ? "Yes" : "Hidden"}
                </Td>
                <Td className="text-[0.74rem] text-admin-muted">
                  {formatDate(item.updated_at)}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/progress/${item.id}`}
                      className="text-[0.66rem] uppercase tracking-[0.12em] text-purple hover:text-plum"
                    >
                      Edit
                    </Link>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : (
        <EmptyState
          title="The board is empty"
          body="Add one entry per initiative so students can see what was proposed and where it stands."
          action={
            <Link href="/admin/progress/new" className="btn btn-primary">
              Add the first entry
            </Link>
          }
        />
      )}
    </div>
  );
}
