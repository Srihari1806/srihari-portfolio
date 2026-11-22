'use client';

import gsap from 'gsap';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { writing, type Piece } from '@/data/cinemaHall';
import type { TvFeed } from '@/lib/live';
import { SCREEN } from './SceneArt';

type Slide = { kind: string; title: string; body?: string; date?: string; url?: string; cta: string };
const KIND: Record<Piece['kind'], string> = { essay: 'Essay', 'x-article': 'X article', review: 'Review', analysis: 'Film analysis' };

/**
 * The big screen: published essays, X articles, reviews and analysis (src/data/cinemaHall.ts),
 * plus any reviews in my Letterboxd diary. Nothing here is written for me.
 */
export function ProjectionScreen({ feed }: { feed: TvFeed | null }) {
  const slides: Slide[] = [
    ...writing.map((w) => ({ kind: KIND[w.kind], title: w.title, body: w.blurb, date: w.date, url: w.url, cta: w.kind === 'x-article' ? 'Read on X' : 'Read' })),
    ...(feed?.films ?? [])
      .filter((f) => f.review)
      .map((f) => ({
        kind: 'Letterboxd review',
        title: `${f.title}${f.year ? ` (${f.year})` : ''}`,
        body: f.review!.length > 320 ? `${f.review!.slice(0, 320).replace(/\s+\S*$/, '')}…` : f.review,
        date: f.watched,
        url: f.url,
        cta: 'Full review',
      })),
  ];
  const [i, setI] = useState(0);
  const film = useRef<HTMLDivElement>(null);
  const n = slides.length;
  const s = slides[Math.min(i, Math.max(0, n - 1))];

  // a short projector flicker whenever the reel changes
  useEffect(() => {
    if (!film.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(film.current, { opacity: 0.2 }, { opacity: 1, duration: 0.5, ease: 'steps(5)' });
  }, [i]);

  return (
    <div className="cn-screen" style={{ left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h }}>
      <div className="cn-screen-grain" aria-hidden="true" />
      {n === 0 ? (
        <div className="cn-leader" ref={film}>
          <div className="cn-leader-count" aria-hidden="true">
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>
          <p className="cn-leader-text">
            Coming soon to this screen
            <small>Essays, X articles, reviews and film analysis</small>
          </p>
        </div>
      ) : (
        <div className="cn-slide" ref={film} aria-live="polite">
          <p className="cn-slide-kind">
            {s.kind}
            {s.date ? ` · ${s.date}` : ''}
          </p>
          <h3 className="cn-slide-title">{s.title}</h3>
          {s.body && <p className="cn-slide-body">{s.body}</p>}
          {s.url && (
            <a className="cn-slide-link" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.cta} <ArrowUpRight aria-hidden="true" />
            </a>
          )}
        </div>
      )}
      {n > 1 && (
        <div className="cn-screen-nav">
          <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} aria-label="Previous reel">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span>
            Reel {i + 1} / {n}
          </span>
          <button type="button" onClick={() => setI((v) => (v + 1) % n)} aria-label="Next reel">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
