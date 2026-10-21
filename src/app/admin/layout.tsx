import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-svh bg-ivory">{children}</div>;
}
