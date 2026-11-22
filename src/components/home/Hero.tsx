import { ArrowUpRight } from 'lucide-react';
import { hero } from '@/data/home';
import { ScribbleUnderline, Sparks } from './Doodles';
import { Mascot } from './Mascot';
import { Collage } from './Collage';

export function Hero() {
  return (
    <section className="hm-hero" aria-labelledby="hm-hero-title">
      <div className="hm-hero-copy">
        <p className="hm-eyebrow">
          <span className="hm-eyebrow-dot" aria-hidden="true" />
          <span className="hm-hide-mobile">{hero.eyebrow}</span>
          <span className="hm-only-mobile">{hero.eyebrowMobile}</span>
        </p>
        <h1 id="hm-hero-title" className="hm-headline">
          <span className="hm-headline-line">Somewhere between</span>{' '}
          <span className="hm-headline-line">
            logic <em>&amp;</em>
            <Sparks className="hm-amp-sparks hm-only-mobile" />{' '}
            <span className="hm-underlined">
              imagination.
              <ScribbleUnderline className="hm-underline" />
            </span>
          </span>
        </h1>
        <p className="hm-hero-text">
          <span className="hm-hide-mobile">{hero.description}</span>
          <span className="hm-only-mobile">{hero.descriptionMobile}</span>
        </p>
        <div className="hm-hero-actions">
          <a href="/work" className="hm-btn hm-btn--dark">
            <svg viewBox="0 0 10 12" className="hm-play" aria-hidden="true">
              <path d="M0 0 10 6 0 12z" fill="currentColor" />
            </svg>
            Explore my work
          </a>
          <a href="#human" className="hm-btn hm-btn--outline">
            Meet the human
            <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
          </a>
        </div>
      </div>

      <div className="hm-hero-art">
        <Mascot />
        <Collage />
      </div>
    </section>
  );
}
