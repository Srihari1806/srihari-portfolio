import { NextResponse } from 'next/server';
import type { Track, TrackFeed } from '@/lib/live';

export const dynamic = 'force-dynamic';

let lastGood: TrackFeed | null = null;

type SpotifyItem = {
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
  external_urls: { spotify: string };
};

const toTrack = (it: SpotifyItem, extra: Partial<Track>): Track => ({
  title: it.name,
  artist: it.artists.map((a) => a.name).join(', '),
  album: it.album?.name,
  // smallest image that is still >= 128px
  art: [...(it.album?.images ?? [])].sort((a, b) => a.width - b.width).find((i) => i.width >= 128)?.url ?? it.album?.images?.[0]?.url,
  url: it.external_urls.spotify,
  durationMs: it.duration_ms,
  playing: false,
  ...extra,
});

/**
 * What's playing (or what played last) on Spotify. Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and
 * SPOTIFY_REFRESH_TOKEN (scopes: user-read-currently-playing user-read-recently-played).
 * Reports "playing" only when Spotify does. No device info is exposed.
 */
export async function GET() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return NextResponse.json<TrackFeed>({ source: 'unavailable', track: null, reason: 'not-configured' });
  try {
    const tok = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
      cache: 'no-store',
    });
    if (!tok.ok) throw new Error(`token HTTP ${tok.status}`);
    const { access_token } = (await tok.json()) as { access_token: string };
    const auth = { Authorization: `Bearer ${access_token}` };

    let track: Track | null = null;
    const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing?additional_types=track', { headers: auth, cache: 'no-store' });
    if (now.status === 200) {
      const j = (await now.json()) as { is_playing: boolean; progress_ms: number; currently_playing_type: string; item: SpotifyItem | null };
      if (j.item && j.currently_playing_type === 'track') track = toTrack(j.item, { playing: !!j.is_playing, progressMs: j.progress_ms });
    } else if (now.status !== 204) throw new Error(`now HTTP ${now.status}`);

    if (!track) {
      const rec = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: auth, cache: 'no-store' });
      if (!rec.ok) throw new Error(`recent HTTP ${rec.status}`);
      const j = (await rec.json()) as { items: { track: SpotifyItem; played_at: string }[] };
      if (j.items?.[0]) track = toTrack(j.items[0].track, { playing: false, playedAt: j.items[0].played_at });
    }
    if (!track) throw new Error('nothing played yet');
    lastGood = { source: 'live', track, fetchedAt: new Date().toISOString() };
    return NextResponse.json(lastGood, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'fetch failed';
    // a cached track is never reported as playing
    if (lastGood?.track) return NextResponse.json<TrackFeed>({ source: 'cached', track: { ...lastGood.track, playing: false }, fetchedAt: lastGood.fetchedAt, reason });
    return NextResponse.json<TrackFeed>({ source: 'unavailable', track: null, reason });
  }
}
