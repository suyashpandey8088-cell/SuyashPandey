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
import { adminListManifesto } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminManifestoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const items = await adminListManifesto();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Manifesto"
        description="Each proposal is published in full on the public manifesto page, with its status and last-updated date. Keep the status honest — Proposed is the correct default for anything not yet under way."
        actions={
          <Link href="/admin/manifesto/new" className="btn btn-primary min-h-10 px-4 py-2 text-[0.7rem]">
            New proposal
          </Link>
        }
      />

      {params.deleted ? <Banner>Proposal deleted.</Banner> : null}

      {items.length ? (
        <DataTable>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Proposal</Th>
              <Th>Theme</Th>
              <Th>Status</Th>
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
                    href={`/admin/manifesto/${item.id}`}
                    className="font-medium text-plum hover:text-purple-700"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[0.66rem] text-admin-muted">
                    /manifesto#{item.slug}
                  </p>
                </Td>
                <Td className="text-[0.8rem] text-charcoal/80">{item.category}</Td>
                <Td>
                  <Badge status={item.status} />
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
                      href={`/admin/manifesto/${item.id}`}
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
          title="No proposals yet"
          body="The manifesto is the substance of the campaign. Add the first proposal with its issue, intended outcome and a realistic first step."
          action={
            <Link href="/admin/manifesto/new" className="btn btn-primary">
              Add a proposal
            </Link>
          }
        />
      )}
    </div>
  );
}
