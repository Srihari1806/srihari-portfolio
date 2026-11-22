import { NextResponse } from 'next/server';
import { letterboxd } from '@/data/tfi';
import { parseLetterboxdRss } from '@/lib/letterboxd';
import type { FilmFeed } from '@/lib/live';

export const dynamic = 'force-dynamic';

let lastGood: FilmFeed | null = null;

/** Recent diary entries from the public Letterboxd RSS feed. Falls back to the last good copy, never invents. */
export async function GET() {
  const user = process.env.LETTERBOXD_USERNAME || letterboxd.username;
  if (!user) return NextResponse.json<FilmFeed>({ source: 'unavailable', entries: [], reason: 'not-configured' });
  try {
    const res = await fetch(`https://letterboxd.com/${encodeURIComponent(user)}/rss/`, {
      next: { revalidate: 1800 },
      headers: { 'User-Agent': 'srihari-portfolio (+room TV)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = parseLetterboxdRss(await res.text());
    if (!entries.length) throw new Error('no diary entries');
    lastGood = { source: 'live', entries, fetchedAt: new Date().toISOString() };
    return NextResponse.json(lastGood, { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' } });
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'fetch failed';
    if (lastGood) return NextResponse.json<FilmFeed>({ ...lastGood, source: 'cached', reason });
    return NextResponse.json<FilmFeed>({ source: 'unavailable', entries: [], reason });
  }
}
