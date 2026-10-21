import type { MetadataRoute } from "next";

import { getUpdates } from "@/lib/data";

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = baseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/manifesto`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/updates`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${origin}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${origin}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const { items } = await getUpdates({ limit: 100 });
  const updateRoutes: MetadataRoute.Sitemap = items.map((update) => ({
    url: `${origin}/updates/${update.slug}`,
    lastModified: update.updated_at ? new Date(update.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...updateRoutes];
}
