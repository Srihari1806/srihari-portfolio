import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { links } from '@/data/profile';
import { SectionHead } from './SectionHead';

const worlds = [
  {
    key: 'cricket',
    title: 'Cricket',
    line: 'The fandom that turned into a data product: observations, arguments and the questions behind CricField.',
    items: ['Fandom', 'Match observations', 'Analytics'],
    link: { label: 'CricField', href: links.cricfield, external: true },
  },
  {
    key: 'cinema',
    title: 'Cinema',
    line: 'A film diary, reviews, and a running curiosity about why audiences show up — and what it costs to bring them.',
    items: ['Film diary', 'Reviews', 'Audience psychology', 'Cinema business'],
    link: { label: 'Enter the cinema', href: '/cinema', external: false },
  },
  {
    key: 'music',
    title: 'Music',
    line: 'Original songs, lyrics in Telugu, playlists and an independent music venture.',
    items: ['Original songs', 'Lyric writing', 'Music discovery', 'Kalakshetra'],
    link: { label: 'Sahitya Rachanalu', href: links.sahitya, external: true },
  },
];

/** "Life outside the terminal" — three worlds that feed the work. Short by design; the full rooms are elsewhere. */
export function LifeOutside({ index = '06' }: { index?: string }) {
  return (
    <section className="hs hs--life" aria-labelledby="hs-life">
      <SectionHead id="hs-life" index={index} kicker="Things I love" title="Life Outside The Terminal." sub="The worlds that inspire what I build." />
      <div className="lf-grid">
        {worlds.map((w) => (
          <article key={w.key} className={`lf-card lf-card--${w.key}`} aria-labelledby={`lf-${w.key}`}>
            <h3 id={`lf-${w.key}`}>{w.title}</h3>
            <p>{w.line}</p>
            <ul>
              {w.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            {w.link.external ? (
              <a href={w.link.href} target="_blank" rel="noopener noreferrer" className="hs-inline-link">
                {w.link.label} <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
              </a>
            ) : (
              <Link href={w.link.href} className="hs-inline-link">
                {w.link.label} <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
