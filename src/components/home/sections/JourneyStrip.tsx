import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { experience } from '@/data/experience';
import { SectionHead } from './SectionHead';

/** Homepage teaser of the career timeline: one line per stop. Tickets and details live on /about. */
export function JourneyStrip() {
  return (
    <section className="hs hs--strip" aria-labelledby="hs-strip">
      <SectionHead id="hs-strip" index="04" kicker="Experience" title="My journey so far." />
      <ol className="js-line">
        {experience.map((e) => (
          <li key={e.key} className={`js-stop js-stop--${e.kind}`}>
            <Link href={`/about#ticket-${e.key}`}>
              <span className="js-dot" aria-hidden="true" />
              <span className="js-period">{e.period}</span>
              <span className="js-title">{e.title}</span>
              <span className="js-org">{e.org}</span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="hs-more">
        <Link href="/about#journey" className="hs-inline-link">
          Full journey, skills and contact on About <ArrowRight aria-hidden="true" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}
