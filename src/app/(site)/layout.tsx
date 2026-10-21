import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import MotionLayer from "@/components/motion/MotionLayer";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <div className="relative flex min-h-svh flex-col bg-ivory">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-plum focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Navbar
        candidateName={settings.candidate_name}
        monogram={settings.monogram}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <MotionLayer />
    </div>
  );
}
