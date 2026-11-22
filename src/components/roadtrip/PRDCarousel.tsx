'use client';

import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { caseStudies, type CaseStudy } from '@/data/caseStudies';
import { useTrip } from './TripContext';

const STATUS = { published: 'Published', 'in-research': 'In research', 'coming-soon': 'Coming soon' } as const;
const pad = (n: number) => String(n).padStart(2, '0');

function Card({ s }: { s: CaseStudy }) {
  const live = s.status === 'published' && !!s.url;
  const body = (
    <>
      <span className={`rt-cs-cover rt-cs-cover--${(s.n - 1) % 5}`} aria-hidden="true">
        {s.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.cover} alt="" loading="lazy" />
        ) : (
          <span className="rt-cs-cover-n">{pad(s.n)}</span>
        )}
      </span>
      <span className="rt-cs-top">
        <span className="rt-cs-n">Study {pad(s.n)}</span>
        <span className={`rt-cs-status is-${s.status}`}>{STATUS[s.status]}</span>
      </span>
      <span className="rt-cs-title">{s.title}</span>
      <span className="rt-cs-desc">{s.description}</span>
      <span className="rt-cs-foot">
        <span className="rt-cs-cat">{s.category}</span>
        {live && (
          <span className="rt-cs-open">
            Read <ArrowUpRight aria-hidden="true" />
          </span>
        )}
      </span>
    </>
  );
  return live ? (
    <a className="rt-cs-card is-live" href={s.url} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <div className={`rt-cs-card is-${s.status}`} aria-disabled="true">
      {body}
    </div>
  );
}

/** Swipeable, snap-scrolling row of case studies. Data: src/data/caseStudies.ts (10 slots). */
export function PRDCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const reduce = useReducedMotion();
  const { discover } = useTrip();

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const left = el.scrollLeft;
    let best = 0;
    cards.forEach((c, i) => {
      if (Math.abs(c.offsetLeft - el.offsetLeft - left) < Math.abs(cards[best].offsetLeft - el.offsetLeft - left)) best = i;
    });
    setIndex(best);
    setEdges({ start: left < 4, end: left + el.clientWidth > el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          sync();
        });
      discover('studies');
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sync);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sync, discover]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = Math.max(0, Math.min(caseStudies.length - 1, i));
    const card = el.children[n] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(caseStudies.length - 1);
    }
  };

  return (
    <div className="rt-cs" role="region" aria-roledescription="carousel" aria-label="Product case studies">
      <div className="rt-cs-bar">
        <p className="rt-cs-count" aria-live="polite">
          <b>{pad(index + 1)}</b> / {pad(caseStudies.length)}
        </p>
        <div className="rt-cs-nav">
          <button type="button" className="rt-cs-arrow" onClick={() => go(index - 1)} disabled={edges.start} aria-label="Previous case study">
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" className="rt-cs-arrow" onClick={() => go(index + 1)} disabled={edges.end} aria-label="Next case study">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={track} className="rt-cs-track" tabIndex={0} onKeyDown={onKey} aria-label="Case studies. Use the left and right arrow keys to move.">
        {caseStudies.map((s) => (
          <Card key={s.n} s={s} />
        ))}
      </div>
      <div className="rt-cs-dots" role="group" aria-label="Choose a case study">
        {caseStudies.map((s, i) => (
          <button
            key={s.n}
            type="button"
            className={`rt-cs-dot${i === index ? ' is-on' : ''}`}
            aria-label={`Study ${s.n}: ${s.title}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
