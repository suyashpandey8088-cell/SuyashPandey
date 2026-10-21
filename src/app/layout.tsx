import type { Metadata, Viewport } from "next";

import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";

import { getSettings } from "@/lib/data";

/** Motion capability flag. Runs before paint so nothing flashes. */
const MOTION_BOOTSTRAP = `(function(){var d=document.documentElement;d.classList.add('js');window.setTimeout(function(){if(!d.classList.contains('motion-ready')){d.classList.add('no-motion')}},3200);})();`;

function resolveMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.site_title;
  const description = settings.site_description;

  return {
    metadataBase: resolveMetadataBase(),
    title: {
      default: title,
      template: `%s · ${settings.candidate_name}`,
    },
    description,
    applicationName: `${settings.candidate_name} — ${settings.institution}`,
    authors: [{ name: settings.candidate_name }],
    keywords: [
      settings.candidate_name,
      settings.institution,
      "Student Council President",
      "student council election",
      "campaign",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: `${settings.candidate_name} — ${settings.institution}`,
      title,
      description,
      url: "/",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    category: "politics",
  };
}

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
