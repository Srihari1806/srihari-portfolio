'use client';

import { useEffect, useState } from 'react';
import type { FilmFeed, TrackFeed, TvFeed } from '@/lib/live';

/** Poll a JSON endpoint while the tab is visible. `null` = still loading. */
function usePoll<T>(url: string, everyMs: number) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    let t = 0;
    const load = async () => {
      try {
        const r = await fetch(url, { cache: 'no-store' });
        const j = (await r.json()) as T;
        if (alive) setData(j);
      } catch {
        if (alive) setData((d) => d ?? ({ source: 'unavailable', reason: 'network' } as T));
      }
    };
    const tick = () => {
      if (document.visibilityState === 'visible') load();
      t = window.setTimeout(tick, everyMs);
    };
    tick();
    const onVis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      window.clearTimeout(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [url, everyMs]);
  return data;
}

export const useNowPlaying = () => usePoll<TrackFeed>('/api/spotify', 60_000);
export const useFilmDiary = () => usePoll<FilmFeed>('/api/letterboxd', 30 * 60_000);
export const useTvFeed = (limit = 3) => usePoll<TvFeed>(`/api/tv?limit=${limit}`, 30 * 60_000);
