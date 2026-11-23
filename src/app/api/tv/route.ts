import { NextResponse } from 'next/server';
import { letterboxd } from '@/data/tfi';
import { fetchDiary } from '@/lib/letterboxd';
import type { TvFeed, TvFilm } from '@/lib/live';
import { resolveFilmVideo } from '@/lib/tvVideos';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const lastGood: Record<number, TvFeed> = {};

/** The room TV: my latest three Letterboxd diary films, each with a verified official YouTube video (or none → poster). */
export async function GET(req: Request) {
  const limit = Math.min(6, Math.max(1, Number(new URL(req.url).searchParams.get('limit')) || 3));
  const officialOnly = new URL(req.url).searchParams.get('official') === '1';
  const cacheKey = officialOnly ? -limit : limit;
  const user = process.env.LETTERBOXD_USERNAME || letterboxd.username;
  if (!user) return NextResponse.json<TvFeed>({ source: 'unavailable', films: [], reason: 'not-configured' });
  try {
    const entries = await fetchDiary(user, limit);
    const films: TvFilm[] = await Promise.all(
      entries.map(async (f) => {
        const r = await resolveFilmVideo(f, officialOnly);
        return { ...f, tmdbId: f.tmdbId ?? r.tmdbId, poster: f.poster ?? r.poster, video: r.video };
      }),
    );
    lastGood[cacheKey] = { source: 'live', films, fetchedAt: new Date().toISOString() };
    return NextResponse.json(lastGood[cacheKey], { headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=1800' } });
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'fetch failed';
    if (lastGood[cacheKey]) return NextResponse.json<TvFeed>({ ...lastGood[cacheKey], source: 'cached', reason });
    return NextResponse.json<TvFeed>({ source: 'unavailable', films: [], reason });
  }
}
