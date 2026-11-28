'use client';

import { useEffect, useState } from 'react';
import { nowPlaying } from '@/data/home';
import type { TrackFeed } from '@/lib/live';

/* What the homepage music cards show. Live Spotify data when the API route is configured
   (SPOTIFY_* in .env.local / Vercel); otherwise the labelled demo from data/home.ts. */

export type NowPlayingView = {
  title: string;
  artist: string;
  art: string | null; // remote album art; null = use the bundled demo cover
  url: string;
  progress: number; // 0..1
  elapsed: string;
  duration: string;
  isDemo: boolean;
  playing: boolean;
  label: 'Now playing' | 'Last played' | 'Now playing';
};

const mmss = (ms?: number) => {
  if (ms == null || !isFinite(ms)) return '';
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const demo: NowPlayingView = {
  title: nowPlaying.track,
  artist: nowPlaying.artist,
  art: null,
  url: nowPlaying.href,
  progress: nowPlaying.progress,
  elapsed: nowPlaying.elapsed,
  duration: nowPlaying.duration,
  isDemo: true,
  playing: true,
  label: 'Now playing',
};

export function useNowPlaying(): NowPlayingView {
  const [feed, setFeed] = useState<TrackFeed | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.hidden) return;
      fetch('/api/spotify', { cache: 'no-store' })
        .then((r) => r.json() as Promise<TrackFeed>)
        .then((f) => alive && setFeed(f))
        .catch(() => {});
    };
    load();
    const poll = window.setInterval(load, 30000);
    const clock = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      alive = false;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  const t = feed?.track;
  if (!t || feed?.source === 'unavailable') return demo;

  // advance the progress bar locally between polls, only while Spotify says it's playing
  const since = feed.fetchedAt ? Date.now() - Date.parse(feed.fetchedAt) : 0;
  const pos = t.playing && t.progressMs != null ? Math.min((t.durationMs ?? Infinity), t.progressMs + since) : t.progressMs;
  void tick;
  return {
    title: t.title,
    artist: t.artist,
    art: t.art ?? null,
    url: t.url,
    progress: pos != null && t.durationMs ? pos / t.durationMs : t.playing ? 0 : 1,
    elapsed: pos != null ? mmss(pos) : '',
    duration: mmss(t.durationMs),
    isDemo: false,
    playing: t.playing && feed.source === 'live',
    label: t.playing && feed.source === 'live' ? 'Now playing' : 'Last played',
  };
}
