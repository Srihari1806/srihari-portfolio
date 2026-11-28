import { hero } from '@/data/home';
import { ScribbleUnderline, Sparks } from './Doodles';
import { Mascot } from './Mascot';
import { Collage } from './Collage';
import { HeroActions } from './HeroActions';

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
        <HeroActions />
      </div>

      <div className="hm-hero-art">
        <Mascot />
        <Collage />
      </div>
    </section>
  );
}
