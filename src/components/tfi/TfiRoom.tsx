'use client';

import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import room from '@/assets/tfi/room.webp';
import blinkImg from '@/assets/tfi/blink.png';
import stWork from '@/assets/tfi/sticker-work.webp';
import stCinema from '@/assets/tfi/sticker-cinema.webp';
import stPlay from '@/assets/tfi/sticker-play.webp';
import stWrite from '@/assets/tfi/sticker-write.webp';
import stMusic from '@/assets/tfi/sticker-music.webp';
import { ROOM, blinkBox, character, letterboxd, objects, spotify, stickers, wallPhotos, type Box, type PoseKey, type Quad, type StickerKey } from '@/data/tfi';
import type { TrackFeed, TvFeed, TvFilm } from '@/lib/live';
import { CalendarPanel } from './CalendarPanel';
import { CutFrame, SceneSelector, TfiCharacter, charactersReady, usePoseDirector } from './TfiCharacter';
import { quadTransform } from './quad';
import { TvSet } from './TvSet';
import { useNowPlaying, useTvFeed } from './useLive';

const STICKER_ART: Record<StickerKey, StaticImageData> = { work: stWork, cinema: stCinema, play: stPlay, write: stWrite, music: stMusic };

const boxStyle = ([x0, y0, x1, y1]: Box): CSSProperties => ({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 });
const isExternal = (href: string) => /^https?:/.test(href);

/** A flat w×h box drawn onto four corners of the illustration. */
function OnQuad({ quad, w, h, className, children }: { quad: Quad; w: number; h: number; className?: string; children: ReactNode }) {
  return (
    <div className={`tfi-quad ${className ?? ''}`} style={{ width: w, height: h, transform: quadTransform(w, h, quad) }}>
      {children}
    </div>
  );
}

/* ---------------- living details ---------------- */
function Blink() {
  const reduce = useReducedMotion();
  const [shut, setShut] = useState(false);
  useEffect(() => {
    if (reduce) return;
    let t = 0;
    const once = (then: () => void) => {
      setShut(true);
      t = window.setTimeout(() => {
        setShut(false);
        then();
      }, 120);
    };
    const schedule = () => {
      t = window.setTimeout(() => {
        // now and then a double blink, like people do
        once(() => (Math.random() < 0.22 ? (t = window.setTimeout(() => once(schedule), 170)) : schedule()));
      }, 2800 + Math.random() * 4200);
    };
    schedule();
    return () => window.clearTimeout(t);
  }, [reduce]);
  return (
    <div className="tfi-blink" style={{ ...boxStyle(blinkBox), opacity: shut ? 1 : 0 }} aria-hidden="true">
      <Image src={blinkImg} alt="" fill sizes="80px" unoptimized />
    </div>
  );
}

/* ---------------- console: Spotify ---------------- */
function PlayerOverlay({ feed }: { feed: TrackFeed }) {
  const t = feed.track;
  const [now, setNow] = useState(() => Date.now());
  const fetched = useRef(Date.now());
  useEffect(() => {
    fetched.current = Date.now();
  }, [feed]);
  useEffect(() => {
    if (!t?.playing) return;
    const i = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(i);
  }, [t?.playing]);
  if (!t) return null;
  const progress = t.playing && t.durationMs ? Math.min(1, ((t.progressMs ?? 0) + (now - fetched.current)) / t.durationMs) : null;
  return (
    <>
      <div className="tfi-sp-art" style={boxStyle(spotify.art)}>
        {t.art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.art} alt="" />
        ) : null}
      </div>
      <div className="tfi-sp-text" style={{ ...boxStyle(spotify.text), background: spotify.panel }}>
        <span className="tfi-sp-title">{t.title}</span>
        <span className="tfi-sp-artist">
          {t.artist}
          <em>{t.playing ? ' · now playing' : ' · last played'}</em>
        </span>
      </div>
      <div className="tfi-sp-progress" style={{ ...boxStyle(spotify.progress), background: spotify.panel }}>
        {progress !== null && (
          <span>
            <i style={{ width: `${progress * 100}%` }} />
          </span>
        )}
      </div>
      {!t.playing && (
        <div className="tfi-sp-btn" style={boxStyle(spotify.button)} aria-hidden="true">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="19" fill="#f6f1ea" />
            <path d="M16 12 L29 20 L16 28 Z" fill="#211b17" />
          </svg>
        </div>
      )}
    </>
  );
}

/* ---------------- hotspots ---------------- */
type Cue = { onPointerEnter?: () => void; onPointerLeave?: () => void; onFocus?: () => void };
/** hovering / focusing a thing in the room suggests the matching shot; clicks are untouched */
const cueFor = (suggest: (p: PoseKey | undefined) => void, pose?: PoseKey): Cue =>
  pose ? { onPointerEnter: () => suggest(pose), onPointerLeave: () => suggest(undefined), onFocus: () => suggest(pose) } : {};

function Spot({ box, label, tip, href, onClick, className = '', id, cue = {} }: { box: Box; label: string; tip: string; href?: string; onClick?: () => void; className?: string; id?: string; cue?: Cue }) {
  const inner = <span className="tfi-tip">{tip}</span>;
  const cls = `tfi-spot ${className}`;
  if (href)
    return isExternal(href) ? (
      <a id={id} className={cls} style={boxStyle(box)} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} {...cue}>
        {inner}
      </a>
    ) : (
      <Link id={id} className={cls} style={boxStyle(box)} href={href} aria-label={label} {...cue}>
        {inner}
      </Link>
    );
  return (
    <button id={id} type="button" className={cls} style={boxStyle(box)} onClick={onClick} aria-label={label} {...cue}>
      {inner}
    </button>
  );
}

function tvTip(f: TvFeed | null) {
  if (!f) return 'Cinema · tuning the TV…';
  return 'Cinema · sample posters (Letterboxd not connected)';
}
function playerTip(s: TrackFeed | null) {
  if (!s) return 'Spotify · loading…';
  if (s.track && s.source === 'live') return `${s.track.playing ? 'Now playing' : 'Last played'} on Spotify · open`;
  if (s.track) return 'Spotify · cached last track · open';
  return 'Sample track — Spotify not connected · open my Spotify';
}

/**
 * The night homepage: the illustration is the background; everything you can click, and everything
 * that changes, sits on top in the artwork's own 1672×941 pixel space (scaled to fit).
 */
export function TfiRoom() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [scaleY, setScaleY] = useState(0);
  const [calOpen, setCalOpen] = useState(false);
  const tv = useTvFeed();
  const music = useNowPlaying();
  const { pose, cutting, cutTo, suggest } = usePoseDirector();

  // phones see part of the room at a time: after a cut, pan to where the new shot is
  const firstPose = useRef(true);
  useEffect(() => {
    if (firstPose.current || !pose || !scale) return void (firstPose.current = false);
    const stage = boxRef.current?.closest('.tfi-stage') as HTMLElement | null;
    if (!stage || stage.scrollWidth <= stage.clientWidth + 2) return;
    const x = character.centreX[pose] * scale;
    if (x > stage.scrollLeft + 40 && x < stage.scrollLeft + stage.clientWidth - 40) return;
    stage.scrollTo({ left: x - stage.clientWidth / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [pose, scale]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / ROOM.w);
      setScaleY(e.contentRect.height / ROOM.h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // diary films with their verified videos; or your own fallback posters; or the drawing itself
  const films: TvFilm[] = tv?.films?.length
    ? tv.films
    : letterboxd.fallbackPosters.map((p) => ({ title: p.title, poster: p.poster, rating: p.rating, url: letterboxd.profileUrl, video: null }));
  const tvLive = !!tv?.films?.length;
  const track = music?.track ?? null;

  return (
    <>
      <div className="tfi-room" ref={boxRef}>
        <Image
          src={room}
          alt={
            charactersReady
              ? "Srihari's room at sunset, drawn from above: a rug with snacks and a notebook, a desk with a laptop, a TV showing Letterboxd, a bed with a teddy bear, and a music console. He moves between the rug, the desk and the bed."
              : "Srihari's room at sunset, drawn from above: he lies on the rug with his phone, thinking about a HYD → TDX flight ticket; a desk with a laptop, a TV showing Letterboxd, a bed with a teddy bear, and a music console."
          }
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 760px) 1500px, 100vw"
          className="tfi-bg"
        />
        <div className="tfi-layer" style={{ width: ROOM.w, height: ROOM.h, transform: `scale(${scale}, ${scaleY})`, visibility: scale && scaleY ? 'visible' : 'hidden' }}>
          {wallPhotos
            .filter((p) => p.src)
            .map((p) => (
              <OnQuad key={p.key} quad={p.quad} w={200} h={260} className="tfi-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.label} />
              </OnQuad>
            ))}
          {charactersReady ? <TfiCharacter pose={pose} cutting={!!cutting} /> : <Blink />}
          {films.length > 0 && (
            <div className="tfi-cue" {...cueFor(suggest, 'tv')}>
              <TvSet films={films} live={tvLive} />
            </div>
          )}
          {track && <PlayerOverlay feed={music as TrackFeed} />}

          {objects
            // once the TV is live it has its own controls, so it stops being one big link
            .filter((o) => !(o.key === 'tv' && films.length > 0))
            .map((o) => (
            <Spot
              key={o.key}
              box={o.box}
              label={o.label}
              tip={o.key === 'tv' ? tvTip(tv) : o.label.split(' — ')[1] ?? o.label}
              href={o.href}
              onClick={o.action === 'calendar' ? () => setCalOpen(true) : undefined}
              className={`tfi-spot--${o.key}`}
              cue={cueFor(suggest, o.pose)}
            />
          ))}
          <Spot
            id="tfi-player"
            box={spotify.player}
            label={track ? `Spotify: ${track.title} by ${track.artist} (${track.playing ? 'now playing' : 'last played'}) — open in Spotify` : 'Open my Spotify'}
            tip={playerTip(music)}
            href={track?.url || spotify.profileUrl}
            className="tfi-spot--player"
            cue={cueFor(suggest, 'rug')}
          />

          {stickers.map((s) => {
            const href = s.key === 'music' ? track?.url || spotify.profileUrl : s.href;
            const ext = isExternal(href);
            const props = { className: `tfi-sticker tfi-sticker--${s.key}`, style: boxStyle(s.box), 'aria-label': `${s.label} — ${s.sub}`, ...cueFor(suggest, s.pose) };
            const art = <Image src={STICKER_ART[s.key]} alt="" fill sizes="240px" />;
            return ext ? (
              <a key={s.key} {...props} href={href} target="_blank" rel="noopener noreferrer">
                {art}
              </a>
            ) : (
              <Link key={s.key} {...props} href={href}>
                {art}
              </Link>
            );
          })}
          {charactersReady && <CutFrame kind={cutting} />}
        </div>
      </div>
      {charactersReady && <SceneSelector pose={pose} onPick={(p) => cutTo(p)} />}
      {scale > 0 && <CalendarPanel open={calOpen} onClose={() => setCalOpen(false)} />}
    </>
  );
}
