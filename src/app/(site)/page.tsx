import type { Metadata } from "next";

import Hero from "@/components/site/Hero";
import About from "@/components/site/sections/About";
import Closing from "@/components/site/sections/Closing";
import Events from "@/components/site/sections/Events";
import Manifesto from "@/components/site/sections/Manifesto";
import Progress from "@/components/site/sections/Progress";
import Statement from "@/components/site/sections/Statement";
import Updates from "@/components/site/sections/Updates";
import Vision from "@/components/site/sections/Vision";
import Voice from "@/components/site/sections/Voice";
import {
  getFeaturedUpdate,
  getManifestoItems,
  getProgressItems,
  getSettings,
  getUpdates,
  getVisionPillars,
  getEvents,
  splitEvents,
} from "@/lib/data";

/** Every request reads fresh content: a published update appears immediately. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.site_title,
    description: settings.site_description,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.site_title,
      description: settings.site_description,
      url: "/",
    },
  };
}

export default async function HomePage() {
  const settings = await getSettings();
  const sections = settings.sections;

  const [pillars, manifestoItems, progressItems, featured, latest, events] =
    await Promise.all([
      getVisionPillars(),
      getManifestoItems(),
      getProgressItems(),
      getFeaturedUpdate(settings),
      getUpdates({ limit: 4 }),
      getEvents(),
    ]);

  const { upcoming, past } = splitEvents(events);
  const latestWithoutFeatured = latest.items
    .filter((update) => update.id !== featured?.id)
    .slice(0, 3);

  return (
    <>
      <Hero settings={settings} latestUpdate={featured} />

      {sections.statement ? <Statement settings={settings} /> : null}
      {sections.about ? <About settings={settings} /> : null}
      {sections.vision ? <Vision pillars={pillars} /> : null}
      {sections.manifesto ? (
        <Manifesto items={manifestoItems} settings={settings} />
      ) : null}
      {sections.updates ? (
        <Updates
          featured={featured}
          latest={latestWithoutFeatured}
          total={latest.total}
          settings={settings}
        />
      ) : null}
      {sections.events ? (
        <Events upcoming={upcoming} past={past} settings={settings} />
      ) : null}
      {sections.progress ? (
        <Progress
          items={progressItems}
          updates={latest.items}
          settings={settings}
        />
      ) : null}
      {sections.voice ? <Voice settings={settings} /> : null}
      {sections.closing ? <Closing settings={settings} /> : null}
    </>
  );
}
