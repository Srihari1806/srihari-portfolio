'use client';

import { ExternalLink, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { letterboxd } from '@/data/tfi';
import type { TvFilm } from '@/lib/live';
import { quadTransform } from './quad';

/* ---------- minimal typings for the YouTube IFrame Player API ---------- */
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(v: number): void;
  seekTo(s: number, allow: boolean): void;
  loadVideoById(id: string): void;
  cueVideoById(id: string): void;
  getPlayerState(): number;
  destroy(): void;
};
type YTNamespace = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytLoading: Promise<YTNamespace> | null = null;
/** Load the official IFrame Player API once. */
function loadYT(): Promise<YTNamespace> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytLoading) return ytLoading;
  ytLoading = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => {
      ytLoading = null;
      reject(new Error('YouTube API failed to load'));
    };
    document.head.appendChild(s);
  });
  return ytLoading;
}

const SCREEN = { w: 276, h: 224 };
const VIDEO = { w: 400, h: 225, scale: 0.65 }; // YouTube's player keeps a ≥200px viewport; we scale it onto the screen
const stars = (r?: number) => (r ? '★'.repeat(Math.floor(r)) + (r % 1 ? '½' : '') : '');
const KIND = { trailer: 'Official trailer', teaser: 'Official teaser', song: 'Official song' } as const;

type Status = 'loading' | 'playing' | 'paused' | 'blocked' | 'poster';

/**
 * The room TV, upgraded: my latest Letterboxd diary films on a real (muted) YouTube player,
 * drawn onto the illustrated screen. Pauses off-screen; never unmutes by itself.
 */
export function TvSet({ films, live }: { films: TvFilm[]; live: boolean }) {
  const reduce = useReducedMotion();
  const quadRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const ready = useRef(false);
  const visible = useRef(false);
  const userPaused = useRef(false);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<Status>('loading');
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const [apiError, setApiError] = useState(false);

  const film = films[Math.min(idx, films.length - 1)];
  const video = film?.video && !failed.has(film.video.id) && !apiError ? film.video : null;
  const videoId = video?.id ?? null;
  const autoplay = !reduce;
  const currentId = useRef<string | null>(null);
  currentId.current = videoId;

  // a new latest diary entry → switch to it, muted
  const latest = films[0] ? `${films[0].url}|${films[0].title}` : '';
  useEffect(() => {
    setIdx(0);
    userPaused.current = false;
    if (player.current && ready.current) player.current.mute();
    setMuted(true);
  }, [latest]);

  const tryPlay = useCallback(() => {
    const p = player.current;
    if (!p || !ready.current || !videoId) return;
    if (!visible.current || userPaused.current || document.visibilityState !== 'visible') return;
    if (!autoplay && muted) return; // reduced motion: only plays when asked
    p.playVideo();
    // if the browser refuses autoplay the state never reaches PLAYING
    window.setTimeout(() => {
      if (player.current && player.current.getPlayerState() !== 1 && visible.current && !userPaused.current) setStatus((s) => (s === 'playing' ? s : 'blocked'));
    }, 2500);
  }, [videoId, autoplay, muted]);

  // create the player once a video exists
  useEffect(() => {
    if (!videoId || player.current || !hostRef.current) return;
    let alive = true;
    setStatus('loading');
    loadYT()
      .then((YT) => {
        if (!alive || !hostRef.current) return;
        player.current = new YT.Player(hostRef.current, {
          width: VIDEO.w,
          height: VIDEO.h,
          videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { autoplay: 0, mute: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, playsinline: 1, rel: 0, origin: window.location.origin },
          events: {
            onReady: () => {
              ready.current = true;
              player.current?.mute();
              setStatus('paused');
              tryPlay();
            },
            onStateChange: (e: { data: number }) => {
              if (e.data === 1) setStatus('playing');
              else if (e.data === 2) setStatus((s) => (s === 'blocked' ? s : 'paused'));
              else if (e.data === 3) setStatus((s) => (s === 'playing' ? s : 'loading'));
              else if (e.data === 0) {
                player.current?.seekTo(0, true); // loop quietly
                player.current?.playVideo();
              }
            },
            onAutoplayBlocked: () => setStatus('blocked'),
            onError: () => {
              // 2/5/100/101/150: bad id, HTML5 error, removed, or embedding not allowed → poster
              const id = currentId.current;
              if (id) setFailed((f) => new Set(f).add(id));
            },
          },
        });
      })
      .catch(() => alive && setApiError(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // switching films reuses the same player
  const shownId = useRef<string | null>(null);
  useEffect(() => {
    const p = player.current;
    if (!p || !ready.current || !videoId || shownId.current === videoId) {
      if (!videoId) {
        p?.pauseVideo?.();
        setStatus('poster');
      }
      shownId.current = videoId ?? shownId.current;
      return;
    }
    shownId.current = videoId;
    setStatus('loading');
    if (visible.current && !userPaused.current && (autoplay || !muted)) p.loadVideoById(videoId);
    else p.cueVideoById(videoId);
  }, [videoId, autoplay, muted]);

  // play only while the TV is on screen and the tab is visible
  useEffect(() => {
    const el = quadRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting) tryPlay();
        else player.current?.pauseVideo?.();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    const onVis = () => (document.visibilityState === 'visible' ? tryPlay() : player.current?.pauseVideo?.());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [tryPlay]);

  // leaving TFI mode unmounts the room: stop and remove the player
  useEffect(
    () => () => {
      try {
        player.current?.destroy();
      } catch {
        /* already gone */
      }
      player.current = null;
      ready.current = false;
    },
    [],
  );

  const togglePlay = () => {
    const p = player.current;
    if (!p || !videoId) return;
    if (status === 'playing') {
      userPaused.current = true;
      p.pauseVideo();
    } else {
      userPaused.current = false;
      p.playVideo();
    }
  };
  const toggleMute = () => {
    const p = player.current;
    if (!p || !videoId) return;
    if (p.isMuted()) {
      p.unMute();
      p.setVolume(70);
      setMuted(false);
      userPaused.current = false;
      if (status !== 'playing') p.playVideo();
    } else {
      p.mute();
      setMuted(true);
    }
  };
  const pick = (i: number) => {
    userPaused.current = false;
    setIdx(i);
  };

  if (!film) return null;
  const showVideo = !!videoId && (status === 'playing' || status === 'paused');
  const label = !live ? 'My picks' : video ? KIND[video.kind] : 'Poster';

  return (
    <div ref={quadRef} className="tfi-quad tfi-tv tfi-tv--live" style={{ width: SCREEN.w, height: SCREEN.h, transform: quadTransform(SCREEN.w, SCREEN.h, letterboxd.screen) }}>
      <div className="tfi-tv-bar">
        <span className="tfi-tv-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <a href={letterboxd.profileUrl} target="_blank" rel="noopener noreferrer" className="tfi-tv-lb">
          Letterboxd
        </a>
        <span className="tfi-tv-state">{idx === 0 ? 'Latest watch' : 'From my diary'}</span>
      </div>

      <div className="tfi-tv-video">
        {/* the poster sits under the player and shows whenever the video can't */}
        {film.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tfi-tv-poster" src={film.poster} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="tfi-tv-poster tfi-tv-noposter">{film.title}</span>
        )}
        <div className="tfi-tv-player" style={{ width: VIDEO.w, height: VIDEO.h, transform: `scale(${VIDEO.scale})`, opacity: showVideo ? 1 : 0 }}>
          <div ref={hostRef} />
        </div>
        {videoId && status === 'loading' && <span className="tfi-tv-note">Tuning in…</span>}
        {videoId && (status === 'blocked' || (status === 'paused' && (reduce || userPaused.current))) && (
          <button type="button" className="tfi-tv-big" onClick={togglePlay} aria-label={`Play the ${video?.kind ?? 'video'} for ${film.title}`}>
            <Play aria-hidden="true" />
          </button>
        )}
        {videoId && status === 'playing' && <button type="button" className="tfi-tv-hit" onClick={togglePlay} aria-label="Pause" />}
        {!videoId && <span className="tfi-tv-note tfi-tv-note--poster">{film.video && !apiError ? 'Video unavailable here' : 'No official video found'}</span>}
      </div>

      <div className="tfi-tv-foot">
        <div className="tfi-tv-ctrls">
          <button type="button" onClick={toggleMute} disabled={!videoId || !showVideo} aria-label={muted ? 'Unmute the TV' : 'Mute the TV'} aria-pressed={!muted}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
          {videoId ? (
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" aria-label={`Open “${video?.name}” on YouTube`}>
              <ExternalLink aria-hidden="true" />
            </a>
          ) : (
            <a href={film.url} target="_blank" rel="noopener noreferrer" aria-label={`Open my diary entry for ${film.title}`}>
              <ExternalLink aria-hidden="true" />
            </a>
          )}
          {videoId && status === 'playing' && (
            <button type="button" onClick={togglePlay} aria-label="Pause the TV">
              <Pause aria-hidden="true" />
            </button>
          )}
        </div>
        <ul className="tfi-tv-thumbs" aria-label="Recent watches">
          {films.slice(0, 3).map((f, i) => (
            <li key={f.url || f.title}>
              <button type="button" className={i === idx ? 'is-on' : ''} onClick={() => pick(i)} aria-pressed={i === idx} aria-label={`${f.title}${f.year ? ` (${f.year})` : ''}${f.rating ? `, rated ${f.rating} of 5` : ''}`}>
                {f.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.poster} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span>{f.title.slice(0, 1)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <p className="tfi-tv-info">
          <b>{film.title}</b>
          <span>
            {film.year}
            {film.rating ? ` · ${stars(film.rating)}` : ''}
          </span>
          <small>{label}</small>
        </p>
      </div>
    </div>
  );
}
