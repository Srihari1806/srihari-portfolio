'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Star, StarHalf } from 'lucide-react';
import album from '@/assets/home/album-evening-drive.jpg';
import film1 from '@/assets/home/film-1.jpg';
import film2 from '@/assets/home/film-2.jpg';
import film3 from '@/assets/home/film-3.jpg';
import lab from '@/assets/home/electronics-lab.jpg';
import pixelDev from '@/assets/home/internet-raised-me.webp';
import { filmDiary } from '@/data/home';
import { useNowPlaying } from './useNowPlaying';

const posters = [film1, film2, film3];

function CardHead({
  dot,
  title,
  id,
  action,
}: {
  dot: string;
  title: string;
  id: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="hm-card-head">
      <h3 id={id} className="hm-card-title">
        <span className={`hm-dot hm-dot--${dot}`} aria-hidden="true" />
        {title}
      </h3>
      {action}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="hm-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const v = rating - i;
        if (v >= 1) return <Star key={i} className="is-on" aria-hidden="true" />;
        if (v > 0) return (
          <span key={i} className="hm-star-half" aria-hidden="true">
            <Star className="is-off" />
            <StarHalf className="is-on" />
          </span>
        );
        return <Star key={i} className="is-off" aria-hidden="true" />;
      })}
    </span>
  );
}

export function NowPlayingCard() {
  const [demoPlaying, setPlaying] = useState(true);
  const n = useNowPlaying();
  const playing = n.isDemo ? demoPlaying : n.playing;
  return (
    <article id="music" className="hm-card hm-card--music" aria-labelledby="hm-np-title">
      <CardHead
        dot="green"
        title={n.label}
        id="hm-np-title"
        action={
          <span className={`hm-eq${playing ? ' is-playing' : ''}`} aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        }
      />
      <div className="hm-np-body">
        {n.art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.art} alt={`Album art: ${n.title}`} className="hm-np-cover" width={120} height={120} />
        ) : (
          <Image src={album} alt="Album art for Evening Drive" className="hm-np-cover" sizes="120px" />
        )}
        <div className="hm-np-info">
          <p className="hm-np-track">
            {n.isDemo ? (
              n.title
            ) : (
              <a href={n.url} target="_blank" rel="noopener noreferrer">
                {n.title}
              </a>
            )}
          </p>
          <p className="hm-np-artist">{n.artist}</p>
          <div
            className="hm-np-progress"
            role="progressbar"
            aria-label="Track progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(n.progress * 100)}
          >
            <span style={{ width: `${n.progress * 100}%` }} />
          </div>
          <p className="hm-np-time">
            {n.isDemo && <span className="hm-np-demo" title="Demo state — Spotify isn't connected yet">demo</span>}
            {n.elapsed && n.duration ? `${n.elapsed} / ${n.duration}` : 'via Spotify'}
          </p>
          {!n.isDemo ? (
            <a className="hm-np-open" href={n.url} target="_blank" rel="noopener noreferrer">
              Open in Spotify <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
            </a>
          ) : (
          <div className="hm-np-controls">
            <button type="button" aria-label="Shuffle (demo)"><Shuffle strokeWidth={1.8} /></button>
            <button type="button" aria-label="Previous track (demo)"><SkipBack strokeWidth={1.8} fill="currentColor" /></button>
            <button
              type="button"
              className="hm-np-play"
              aria-label={playing ? 'Pause (demo)' : 'Play (demo)'}
              aria-pressed={playing}
              onClick={() => setPlaying((v) => !v)}
            >
              {playing ? <Pause fill="currentColor" strokeWidth={0} /> : <Play fill="currentColor" strokeWidth={0} />}
            </button>
            <button type="button" aria-label="Next track (demo)"><SkipForward strokeWidth={1.8} fill="currentColor" /></button>
            <button type="button" aria-label="Repeat (demo)"><Repeat strokeWidth={1.8} /></button>
          </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function FilmDiaryCard() {
  return (
    <article id="cinema-card" className="hm-card hm-card--film" aria-labelledby="hm-film-title">
      <CardHead
        dot="orange"
        title="Film diary"
        id="hm-film-title"
        action={
          <Link href="/cinema" className="hm-card-link" aria-label="Open my cinema page">
            <ArrowRight strokeWidth={1.7} />
          </Link>
        }
      />
      <p className="hm-card-sub">
        {filmDiary.isDemo ? (
          <>
            <span className="hm-np-demo" title="Placeholder stills — the live diary is on the cinema page">sample</span> · live diary on the cinema page
          </>
        ) : (
          <>
            Recent watches · {filmDiary.average} avg <Star className="hm-sub-star" aria-hidden="true" />
          </>
        )}
      </p>
      <ul className="hm-posters">
        {filmDiary.films.map((f, i) => (
          <li key={f.title}>
            <Image src={posters[i]} alt={`Poster: ${f.title}`} className="hm-poster" sizes="100px" />
            <Stars rating={f.rating} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ElectronicsLabCard() {
  return (
    <article id="lab-card" className="hm-card hm-card--lab" aria-labelledby="hm-lab-title">
      <CardHead
        dot="blue"
        title="Electronics lab"
        id="hm-lab-title"
        action={
          <Link href="/lab" className="hm-card-link" aria-label="See my lab projects">
            <ArrowUpRight strokeWidth={1.7} />
          </Link>
        }
      />
      <p className="hm-card-desc">Circuits, embedded systems and random hardware experiments.</p>
      <Image
        src={lab}
        alt="Arduino board wired to a breadboard with an oscilloscope trace behind it"
        className="hm-card-img"
        sizes="(min-width: 1200px) 320px, (min-width: 560px) 45vw, 92vw"
      />
    </article>
  );
}

export function InternetRaisedMeCard() {
  return (
    <article className="hm-card hm-card--meme" aria-labelledby="hm-meme-title">
      <CardHead
        dot="purple"
        title="The internet raised me"
        id="hm-meme-title"
        action={
          <a href="#top" className="hm-card-link" aria-label="Back to top">
            <ArrowUpRight strokeWidth={1.7} />
          </a>
        }
      />
      <p className="hm-card-desc">A small corner for memes, GIFs and other questionable humour.</p>
      <Image
        src={pixelDev}
        alt='Pixel-art developer at a laptop at night saying "Just one more commit..."'
        className="hm-card-img hm-card-img--pixel"
        sizes="(min-width: 1200px) 310px, (min-width: 560px) 45vw, 92vw"
      />
    </article>
  );
}

export function ActivityWidgets() {
  return (
    <div className="hm-widgets">
      <NowPlayingCard />
      <FilmDiaryCard />
      <ElectronicsLabCard />
      <InternetRaisedMeCard />
    </div>
  );
}
