'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Cpu, Gamepad2, Heart, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Star } from 'lucide-react';
import album from '@/assets/home/album-evening-drive.jpg';
import film1 from '@/assets/home/film-1.jpg';
import film2 from '@/assets/home/film-2.jpg';
import film3 from '@/assets/home/film-3.jpg';
import labImg from '@/assets/home/electronics-lab.jpg';
import memePixel from '@/assets/home/meme-corner-pixel.webp';
import { filmDiary, lab, memeCorner } from '@/data/home';
import { useNowPlaying } from './useNowPlaying';
import { Sparks, SpotifyMark } from './Doodles';

const posters = [film1, film2, film3];

function NowPlayingMini() {
  const [demoPlaying, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const n = useNowPlaying();
  const playing = n.isDemo ? demoPlaying : n.playing;
  return (
    <article id="music-m" className="hm-mw-card hm-mw-music" aria-labelledby="hm-mw-np">
      <div className="hm-mw-head">
        <h3 id="hm-mw-np">
          <SpotifyMark className="hm-mw-spotify" />
          {n.label}
        </h3>
        <span className={`hm-eq hm-eq--mini${playing ? ' is-playing' : ''}`} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
      <div className="hm-mw-np-body">
        {n.art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.art} alt={`Album art: ${n.title}`} className="hm-mw-cover" width={56} height={56} />
        ) : (
          <Image src={album} alt="Album art for Evening Drive" className="hm-mw-cover" sizes="56px" />
        )}
        <div className="hm-mw-np-info">
          <div className="hm-mw-np-title">
            <p>{n.isDemo ? n.title : <a href={n.url} target="_blank" rel="noopener noreferrer">{n.title}</a>}</p>
            <button
              type="button"
              aria-label={liked ? 'Unlike (demo)' : 'Like (demo)'}
              aria-pressed={liked}
              onClick={() => setLiked((v) => !v)}
            >
              <Heart strokeWidth={1.8} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="hm-mw-np-artist">{n.artist}</p>
          <div
            className="hm-mw-progress"
            role="progressbar"
            aria-label="Track progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(n.progress * 100)}
          >
            <span style={{ width: `${n.progress * 100}%` }} />
          </div>
          <p className="hm-mw-time">
            {n.isDemo && <span title="Demo state — Spotify isn't connected yet">demo</span>}
            {n.elapsed && n.duration ? `${n.elapsed} / ${n.duration}` : 'via Spotify'}
          </p>
        </div>
      </div>
      {!n.isDemo ? (
        <a className="hm-np-open" href={n.url} target="_blank" rel="noopener noreferrer">
          Open in Spotify <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
        </a>
      ) : (
      <div className="hm-mw-controls">
        <button type="button" aria-label="Shuffle (demo)"><Shuffle strokeWidth={1.8} /></button>
        <button type="button" aria-label="Previous track (demo)"><SkipBack strokeWidth={1.8} fill="currentColor" /></button>
        <button
          type="button"
          className="hm-mw-play"
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
    </article>
  );
}

function CinemaDiaryMini() {
  return (
    <article id="cinema-m" className="hm-mw-card hm-mw-cinema" aria-labelledby="hm-mw-cine">
      <div className="hm-mw-head">
        <h3 id="hm-mw-cine">
          <span className="hm-mw-dots" aria-hidden="true">
            <i /><i /><i />
          </span>
          Cinema diary
          {filmDiary.isDemo && <span className="hm-np-demo" style={{ marginLeft: 6, fontSize: 10 }}>sample</span>}
        </h3>
        <a href="/cinema" className="hm-mw-link" aria-label="Open my cinema page">
          <ArrowUpRight strokeWidth={1.8} />
        </a>
      </div>
      <ul className="hm-mw-posters" aria-label="Recent watches">
        {filmDiary.films.map((f, i) => (
          <li key={f.title}>
            <Image src={posters[i]} alt={`Poster: ${f.title}`} sizes="64px" />
            <span aria-label={`Rated ${f.rating} out of 5`}>
              <Star aria-hidden="true" />
              {f.rating.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function LabRow() {
  return (
    <article id="lab-m" className="hm-mw-lab" aria-labelledby="hm-mw-lab">
      <Image
        src={labImg}
        alt="Arduino board wired to a breadboard with an oscilloscope trace behind it"
        className="hm-mw-lab-img"
        sizes="50vw"
      />
      <div className="hm-mw-lab-body">
        <Sparks className="hm-mw-lab-sparks" />
        <h3 id="hm-mw-lab">
          <Cpu strokeWidth={1.6} aria-hidden="true" />
          {lab.title}
        </h3>
        <p>{lab.text}</p>
        <Link href="/lab" className="hm-mw-lab-btn">
          Check the lab <ArrowUpRight aria-hidden="true" strokeWidth={1.9} />
        </Link>
      </div>
    </article>
  );
}

function MemeCorner() {
  return (
    <article id="memes-m" className="hm-mw-meme" aria-labelledby="hm-mw-meme">
      <Image
        src={memePixel}
        alt='Pixel-art developer at a laptop saying "Just one more commit..."'
        className="hm-mw-meme-img"
        sizes="50vw"
      />
      <div className="hm-mw-meme-body">
        <h3 id="hm-mw-meme">
          <Gamepad2 strokeWidth={1.6} aria-hidden="true" />
          {memeCorner.title}
        </h3>
        <p>{memeCorner.text}</p>
        <Link href={memeCorner.href} className="hm-mw-link hm-mw-meme-link" aria-label="Open the meme corner">
          <ArrowUpRight strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  );
}

/** Phone-only widget stack (below 768px). */
export function MobileWidgets() {
  return (
    <div className="hm-mw hm-only-mobile">
      <div className="hm-mw-row">
        <NowPlayingMini />
        <CinemaDiaryMini />
      </div>
      <LabRow />
      <MemeCorner />
    </div>
  );
}
