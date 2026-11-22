import { SiteHeader } from './SiteHeader';
import { Hero } from './Hero';
import { FeaturedProject } from './FeaturedProject';
import { ActivityWidgets } from './ActivityWidgets';
import { InterestNav } from './InterestNav';
import { HomeFooter } from './HomeFooter';
import { Reveal } from './Reveal';
import { MobileWidgets } from './MobileWidgets';
import { MobileTabBar } from './MobileTabBar';
import './home.css';

/** Approved "Normal Mode" homepage. Matches the reference composition 1:1 at 1536px and scales down to 1200px. */
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
        </main>
        <HomeFooter />
        <MobileTabBar />
      </div>
    </div>
  );
}
