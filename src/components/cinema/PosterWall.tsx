'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Play, RotateCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { letterboxd } from '@/data/tfi';
import type { TvFeed, TvFilm, TvVideo } from '@/lib/live';
import { POSTERS } from './SceneArt';

const stars = (r?: number) => (r ? '★'.repeat(Math.floor(r)) + (r % 1 ? '½' : '') : '');
const fmtDate = (d?: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Official trailer in a modal — YouTube's own (privacy-enhanced) embed, started by the visitor. */
export function TrailerModal({ film, video, onClose }: { film: TvFilm; video: TvVideo; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const last = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      last?.focus?.();
    };
  }, [onClose]);
  return createPortal(
    <motion.div className="cn-modal" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="cn-trailer"
        role="dialog"
        aria-modal="true"
        aria-label={`${video.name}`}
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? false : { scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <button ref={closeRef} type="button" className="cn-modal-close" onClick={onClose} aria-label="Close trailer">
          <X aria-hidden="true" />
        </button>
        <div className="cn-trailer-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
            title={video.name}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="cn-trailer-cap">
          <b>{film.title}</b> {film.year && <span>({film.year})</span>} · {video.name}
          <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
            Watch on YouTube <ArrowUpRight aria-hidden="true" />
          </a>
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function Poster({ film, i, onTrailer }: { film: TvFilm; i: number; onTrailer: (f: TvFilm) => void }) {
  const [flip, setFlip] = useState(false);
  const p = POSTERS[i];
  return (
    <div className={`cn-poster${flip ? ' is-flipped' : ''}`} style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
      <div className="cn-poster-inner">
        <button type="button" className="cn-poster-front" onClick={() => setFlip(true)} aria-label={`${film.title}${film.year ? ` (${film.year})` : ''} — show details`}>
          {film.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={film.poster} alt="" loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <span className="cn-poster-type">{film.title}</span>
          )}
          {film.rating ? <span className="cn-poster-stars">{stars(film.rating)}</span> : null}
        </button>
        <div className="cn-poster-back" aria-hidden={!flip}>
          <p className="cn-poster-title">{film.title}</p>
          <p className="cn-poster-meta">
            {film.year}
            {film.watched ? ` · watched ${fmtDate(film.watched)}` : ''}
          </p>
          <p className="cn-poster-rate">{film.rating ? stars(film.rating) : 'Not rated'}</p>
          <div className="cn-poster-acts">
            {film.video && (
              <button type="button" tabIndex={flip ? 0 : -1} onClick={() => onTrailer(film)}>
                <Play aria-hidden="true" /> {film.video.kind === 'song' ? 'Song' : film.video.kind === 'teaser' ? 'Teaser' : 'Trailer'}
              </button>
            )}
            {film.url && (
              <a href={film.url} target="_blank" rel="noopener noreferrer" tabIndex={flip ? 0 : -1}>
                Diary <ArrowUpRight aria-hidden="true" />
              </a>
            )}
          </div>
          <button type="button" className="cn-poster-turn" tabIndex={flip ? 0 : -1} onClick={() => setFlip(false)} aria-label="Turn the poster back">
            <RotateCw aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** The corridor: my latest Letterboxd watches as framed posters (up to six). */
export function PosterWall({ feed }: { feed: TvFeed | null }) {
  const [trailer, setTrailer] = useState<TvFilm | null>(null);
  const close = useCallback(() => setTrailer(null), []);
  const films: TvFilm[] = feed?.films?.length
    ? feed.films.slice(0, POSTERS.length)
    : letterboxd.fallbackPosters.map((p) => ({ title: p.title, poster: p.poster, rating: p.rating, url: letterboxd.profileUrl, video: null }));

  return (
    <>
      {films.map((f, i) => (
        <Poster key={f.url + f.title} film={f} i={i} onTrailer={setTrailer} />
      ))}
      {/* empty frames say what's going on instead of pretending */}
      {POSTERS.slice(films.length).map((p, i) => (
        <div key={p.x} className="cn-poster cn-poster--empty" style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>
          <span>{i === 0 && !films.length ? (feed ? 'My Letterboxd diary isn’t connected yet' : 'Fetching my diary…') : 'Next watch'}</span>
        </div>
      ))}
      {feed?.source === 'cached' && <p className="cn-corridor-note">Showing my last saved diary — Letterboxd is unreachable right now.</p>}
      <AnimatePresence>{trailer?.video && <TrailerModal film={trailer} video={trailer.video} onClose={close} />}</AnimatePresence>
    </>
  );
}
