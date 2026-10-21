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
import { adminListVision } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminVisionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pillars = await adminListVision();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Vision pillars"
        description="The editorial panels in the Vision section of the homepage. Order them the way the argument should unfold."
        actions={
          <Link href="/admin/vision/new" className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]">
            Add pillar
          </Link>
        }
      />

      {params.deleted ? <Banner>Pillar deleted.</Banner> : null}

      {pillars.length ? (
        <DataTable>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Pillar</Th>
              <Th>Kicker</Th>
              <Th>Status</Th>
              <Th>Visible</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pillars.map((pillar) => (
              <tr key={pillar.id} className="hover:bg-ivory/60">
                <Td className="w-16 font-mono text-[0.72rem] text-admin-muted">
                  {String(pillar.display_order).padStart(2, "0")}
                </Td>
                <Td>
                  <Link
                    href={`/admin/vision/${pillar.id}`}
                    className="font-medium text-plum hover:text-purple-700"
                  >
                    {pillar.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-[0.72rem] text-admin-muted">
                    {pillar.summary}
                  </p>
                </Td>
                <Td className="text-[0.78rem] text-charcoal/80">{pillar.kicker || "—"}</Td>
                <Td>
                  <Badge status={pillar.status} />
                </Td>
                <Td className="text-[0.74rem] text-admin-muted">
                  {pillar.is_visible ? "Yes" : "Hidden"}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/vision/${pillar.id}`}
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
          title="No pillars yet"
          body="Each pillar introduces a campaign theme on the homepage with the student need, the approach and the potential benefit."
          action={
            <Link href="/admin/vision/new" className="btn btn-primary">
              Add the first pillar
            </Link>
          }
        />
      )}
    </div>
  );
}
