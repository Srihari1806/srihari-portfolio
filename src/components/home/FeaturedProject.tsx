import { getImageProps } from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import stadium from '@/assets/home/cricfield-stadium.jpg';
import stadiumMobile from '@/assets/home/cricfield-stadium-mobile.jpg';
import { featuredProject as p } from '@/data/home';
import { ScribbleUnderline, Sparkline } from './Doodles';

const BAR_HEIGHTS = [30, 45, 38, 62, 52, 70, 88];

function Bars({ className, heights = BAR_HEIGHTS }: { className: string; heights?: number[] }) {
  return (
    <div className={className} aria-hidden="true">
      {heights.map((h, i) => (
        <i key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function FeaturedProject() {
  const common = { alt: '', sizes: '(min-width: 1200px) 52vw, 100vw' };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: stadium });
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: stadiumMobile });

  return (
    <article className="hm-feature" aria-labelledby="hm-feature-title">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...imgProps} className="hm-feature-img" />
      </picture>
      <div className="hm-feature-shade" aria-hidden="true" />

      {/* Desktop / tablet mock-up panel */}
      <div
        className="hm-metrics hm-hide-mobile"
        role="img"
        aria-label="Illustrative analytics mock-up: player impact, run rate and wicket probability"
      >
        <div className="hm-metric hm-metric--impact">
          <span>Player Impact</span>
          <strong>{p.mockMetrics.playerImpact}</strong>
        </div>
        <Sparkline className="hm-metric-spark" />
        <div className="hm-metric hm-metric--rate">
          <span>Run Rate</span>
          <strong>{p.mockMetrics.runRate}</strong>
        </div>
        <div className="hm-metric hm-metric--wicket">
          <span>Wicket Prob.</span>
          <strong>{p.mockMetrics.wicketProb}</strong>
        </div>
        <Bars className="hm-metric-bars" />
      </div>

      {/* Mobile mock-up chip */}
      <div className="hm-chip hm-only-mobile" role="img" aria-label="Illustrative mock-up: player impact +0.42">
        <span>Impact</span>
        <div>
          <strong>{p.mockMetrics.playerImpact}</strong>
          <Sparkline className="hm-chip-spark" />
          <Bars className="hm-chip-bars" heights={[35, 55, 45, 75, 100]} />
        </div>
      </div>

      <div className="hm-feature-copy">
        <p className="hm-feature-eyebrow">
          <span aria-hidden="true" />
          Featured project
        </p>
        <h2 id="hm-feature-title" className="hm-feature-title">
          {p.name}
          <ScribbleUnderline className="hm-feature-underline" />
        </h2>
        <p className="hm-feature-text">
          <span className="hm-hide-mobile">{p.tagline}</span>
          <span className="hm-only-mobile">{p.taglineMobile}</span>
        </p>
        <ul className="hm-tags hm-hide-mobile" aria-label="Project areas">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <ul className="hm-tags hm-only-mobile" aria-label="Project areas">
          {p.tagsMobile.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="hm-feature-actions">
          <a href={p.href} target="_blank" rel="noopener noreferrer" className="hm-btn hm-btn--lime">
            View project
            <ArrowUpRight aria-hidden="true" strokeWidth={1.9} />
          </a>
          <a href={p.caseStudyHref} target="_blank" rel="noopener noreferrer" className="hm-case-link hm-hide-mobile">
            Case study
          </a>
        </div>
      </div>
    </article>
  );
}
