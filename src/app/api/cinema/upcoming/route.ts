import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET() {
  const key = process.env.TMDB_API_KEY;
  const token = process.env.TMDB_READ_TOKEN;
  if (!key && !token) return NextResponse.json({ source: 'unavailable', movies: [], reason: 'not-configured' });
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const end = new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);
  try {
    const url = new URL('https://api.themoviedb.org/3/discover/movie');
    const params = { language: 'en-US', include_adult: 'false', with_original_language: 'te', 'primary_release_date.gte': today, 'primary_release_date.lte': end, sort_by: 'popularity.desc' };
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    if (key) url.searchParams.set('api_key', key);
    const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, next: { revalidate: 3600 }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('provider-unavailable');
    const data = await response.json() as { results: { id: number; title: string; poster_path: string | null; release_date: string }[] };
    const movies = data.results.filter(m => m.poster_path && m.release_date >= today).slice(0, 8).map(m => ({ id: m.id, title: m.title, poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`, releaseDate: m.release_date, url: `https://www.themoviedb.org/movie/${m.id}` }));
    return NextResponse.json({ source: 'live', movies, fetchedAt: new Date().toISOString(), attribution: 'TMDB · Telugu upcoming releases · dates subject to change' });
  } catch {
    return NextResponse.json({ source: 'unavailable', movies: [], reason: 'provider-unavailable' });
  }
}
