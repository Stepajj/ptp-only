import { AboutService } from "./components/AboutService";
import { FAQ } from "./components/FAQ";
import { Hero } from "./components/Hero";
import { Limits } from "./components/Limits";
import { SixSteps } from "./components/SixSteps";
import { Stats } from "./components/Stats";
import { getPublishedContent } from '@/features/content/content';

export async function LandingPage() {
  const published = await getPublishedContent() || [];
  return (
    <>
      <main>
        <Hero />
      </main>
      <Stats />
      <AboutService />
      <SixSteps showDetailedGuideLink={published.some((page) => page.slug === 'how-it-works' && page.type === 'HOW_IT_WORKS')} />
      <Limits />  
      <FAQ />
    </>
  );
}
