import { SiteHeader } from './SiteHeader';
import { Hero } from './Hero';
import { FeaturedProject } from './FeaturedProject';
import { ActivityWidgets } from './ActivityWidgets';
import { InterestNav } from './InterestNav';
import { Reveal } from './Reveal';
import { MobileWidgets } from './MobileWidgets';
import { MobileTabBar } from './MobileTabBar';
import { Suitcase } from './sections/Suitcase';
import { Destinations } from './sections/Destinations';
import { RouteMap } from './sections/RouteMap';
import { PlatformFooter } from './sections/PlatformFooter';
import './home.css';
import './sections/sections.css';

/** Approved "Normal Mode" homepage (first screen unchanged), then a short hub: each section points to the page that tells the full story. */
export function NormalHome({ onToggleTheme }: { onToggleTheme?: () => void }) {
  return (
    <div className="hm" id="top">
      <div className="hm-page">
        <SiteHeader onToggleTheme={onToggleTheme} />
        <main>
          <Hero />
          <section className="hm-grid" aria-label="Featured work and what I'm up to">
            <div className="hm-grid-main" id="work">
              <Reveal>
                <FeaturedProject />
              </Reveal>
              <Reveal delay={0.05} className="hm-hide-mobile">
                <InterestNav />
              </Reveal>
            </div>
            <Reveal delay={0.08} className="hm-hide-mobile">
              <ActivityWidgets />
            </Reveal>
            <MobileWidgets />
          </section>
          {/* folded inside the ADMIT ONE ticket above; unfolds here */}
          <Suitcase />
          <Destinations />
          <RouteMap />
        </main>
        <PlatformFooter />
        <MobileTabBar />
      </div>
    </div>
  );
}
