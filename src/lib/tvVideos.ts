// Picks an official YouTube video for a film from the Letterboxd diary.
//
// Order: TMDB movie videos (by the TMDB id Letterboxd gives us) → YouTube Data API search (only if
// YOUTUBE_API_KEY is set). Official trailers first, then official teasers, then official songs.
// Every pick is checked on YouTube for availability and embedding permission before it is used,
// and the result is cached server-side (memory + a small JSON file) so searches don't repeat.
//
// Env: TMDB_API_KEY (v3 key) or TMDB_READ_TOKEN (v4 token) — required for TMDB.
//      YOUTUBE_API_KEY — optional; enables the fallback search and stricter embed checks.

import { promises as fs } from 'fs';
import path from 'path';
import type { FilmEntry, TvVideo } from './live';

export type TmdbVideo = { key: string; name: string; site: string; type: string; official: boolean; published_at?: string; iso_639_1?: string };
type Resolved = { video: TvVideo | null; poster?: string; tmdbId?: number; at: number };

const DAY = 86_400_000;
const TTL_FOUND = 14 * DAY;
const TTL_MISSING = 1 * DAY;
const BLOCK = /fan[\s-]?made|fanmade|reaction|review|spoof|parody|\bedit\b|re-?upload|status|mashup|recreat|cover\b|karaoke|unofficial/i;
const SONG = /song|lyric|lyrical|jukebox|full video|video song|music video/i;

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Words that decorate a video title around the film's name. */
const DECOR = /\b(official|trailers?|teasers?|glimpses?|first look|lyrical|lyrics?|video|songs?|full|movie|film|telugu|hindi|tamil|malayalam|kannada|english|4k|hd|uhd|from|new|latest|release|promo|theatrical)\b/gi;

/** Does one whole segment of a YouTube title name exactly this film? ("The Paradise - Official Teaser | Nani") */
export function titleNamesFilm(videoTitle: string, filmTitle: string) {
  const want = norm(filmTitle);
  if (!want) return false;
  return videoTitle
    .split(/\s[-–—|:]\s|[|()\[\]“”"]/)
    .map((seg) => norm(seg.replace(/#\S+/g, '').replace(DECOR, ' ')))
    .some((seg) => seg === want);
}

function kindOf(v: { type: string; name: string }): TvVideo['kind'] | null {
  if (BLOCK.test(v.name)) return null;
  if (v.type === 'Trailer') return 'trailer';
  if (v.type === 'Teaser') return 'teaser';
  if ((v.type === 'Clip' || v.type === 'Featurette') && SONG.test(v.name)) return 'song';
  return null;
}

/** Rank TMDB videos: official trailer > official teaser > official song; original language first; newest first. */
export function rankTmdbVideos(results: TmdbVideo[], originalLanguage?: string) {
  const base = { trailer: 300, teaser: 200, song: 100 } as const;
  return results
    .filter((v) => v.site === 'YouTube' && v.key)
    .map((v) => {
      const kind = kindOf(v);
      if (!kind) return null;
      // TMDB's "official" flag is sometimes missing for Indian releases; accept those only when the
      // uploader titled it official, and rank them below flagged ones.
      const official = v.official || /official/i.test(v.name);
      if (!official) return null;
      let score: number = base[kind] + (v.official ? 50 : 0);
      if (originalLanguage && v.iso_639_1 === originalLanguage) score += 20;
      else if (v.iso_639_1 === 'en') score += 10;
      return { v, kind, score, t: Date.parse(v.published_at ?? '') || 0 };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.score - a.score || b.t - a.t)
    .map(({ v, kind }) => ({ id: v.key, name: v.name, kind, via: 'tmdb' as const }));
}

export type YtSearchItem = { id: { videoId?: string }; snippet: { title: string; channelTitle: string; publishedAt: string } };

/** Strict filter for YouTube search results: same film title, right era, an official-looking video type. */
export function acceptYoutubeResult(item: YtSearchItem, film: { title: string; year?: string }) {
  const id = item.id.videoId;
  if (!id) return null;
  const title = item.snippet.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  if (BLOCK.test(title)) return null;
  if (!titleNamesFilm(title, film.title)) return null;
  const isTrailer = /trailer/i.test(title);
  const isTeaser = /teaser|glimpse|first look/i.test(title);
  const isSong = SONG.test(title);
  if (!isTrailer && !isTeaser && !isSong) return null;
  if (film.year) {
    const y = Number(film.year);
    const py = new Date(item.snippet.publishedAt).getFullYear();
    if (py < y - 2 || py > y + 1) return null; // an old film with a new title clash, or vice versa
  }
  const kind: TvVideo['kind'] = isTrailer ? 'trailer' : isTeaser ? 'teaser' : 'song';
  return { id, name: title, kind, via: 'youtube' as const, rank: (isTrailer ? 3 : isTeaser ? 2 : 1) + (/official/i.test(title) ? 0.5 : 0) };
}

/* ---------------- network ---------------- */
async function tmdb(pathname: string, params: Record<string, string> = {}) {
  const key = process.env.TMDB_API_KEY;
  const token = process.env.TMDB_READ_TOKEN;
  if (!key && !token) throw new Error('TMDB not configured');
  const url = new URL(`https://api.themoviedb.org/3${pathname}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (key) url.searchParams.set('api_key', key);
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, next: { revalidate: 86_400 } });
  if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
  return res.json();
}

/** Is this YouTube video public, available and allowed to be embedded? */
export async function embeddable(id: string): Promise<boolean> {
  const key = process.env.YOUTUBE_API_KEY;
  try {
    if (key) {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id=${id}&key=${key}`, { cache: 'no-store' });
      if (!r.ok) return false;
      const j = (await r.json()) as { items?: { status: { embeddable: boolean; privacyStatus: string }; contentDetails?: { regionRestriction?: { blocked?: string[]; allowed?: string[] } } }[] };
      const it = j.items?.[0];
      if (!it || !it.status.embeddable || it.status.privacyStatus !== 'public') return false;
      const rr = it.contentDetails?.regionRestriction;
      return !(rr?.blocked?.includes('IN') || (rr?.allowed && !rr.allowed.includes('IN')));
    }
    // no key: YouTube's oEmbed answers 200 only for public videos whose owner allows embedding
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, { cache: 'no-store' });
    return r.ok;
  } catch {
    return false;
  }
}

async function findTmdbId(film: FilmEntry): Promise<number | undefined> {
  if (film.tmdbId) return film.tmdbId;
  const j = (await tmdb('/search/movie', { query: film.title, ...(film.year ? { year: film.year } : {}) })) as {
    results: { id: number; title: string; original_title: string; release_date?: string }[];
  };
  const want = norm(film.title);
  // exact title (or original title) and the same release year — never "close enough"
  return j.results.find((r) => (norm(r.title) === want || norm(r.original_title) === want) && (!film.year || r.release_date?.startsWith(film.year)))?.id;
}

async function viaTmdb(film: FilmEntry): Promise<{ video: TvVideo | null; poster?: string; tmdbId?: number }> {
  const id = await findTmdbId(film);
  if (!id) return { video: null };
  const d = (await tmdb(`/movie/${id}`, {
    append_to_response: 'videos',
    language: 'en-US',
    include_video_language: 'en,te,hi,ta,ml,kn,null',
  })) as { title: string; original_title: string; release_date?: string; original_language?: string; poster_path?: string; videos?: { results: TmdbVideo[] } };
  // the id must really be this film: same year (±1 for regional release dates)
  const y = Number(film.year);
  const ry = Number(d.release_date?.slice(0, 4));
  if (y && ry && Math.abs(y - ry) > 1) return { video: null, tmdbId: id };
  const poster = d.poster_path ? `https://image.tmdb.org/t/p/w342${d.poster_path}` : undefined;
  for (const c of rankTmdbVideos(d.videos?.results ?? [], d.original_language).slice(0, 5)) {
    if (await embeddable(c.id)) return { video: c, poster, tmdbId: id };
  }
  return { video: null, poster, tmdbId: id };
}

async function viaYoutube(film: FilmEntry): Promise<TvVideo | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const q = `${film.title} ${film.year ?? ''} official trailer`;
  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=10&q=${encodeURIComponent(q)}&key=${key}`,
    { cache: 'no-store' },
  );
  if (!r.ok) return null;
  const j = (await r.json()) as { items?: YtSearchItem[] };
  const picks = (j.items ?? [])
    .map((it) => acceptYoutubeResult(it, film))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.rank - a.rank);
  for (const p of picks.slice(0, 4)) {
    if (await embeddable(p.id)) return { id: p.id, name: p.name, kind: p.kind, via: 'youtube' };
  }
  return null;
}

/* ---------------- cache ---------------- */
const mem = new Map<string, Resolved>();
const inflight = new Map<string, Promise<Resolved>>();
const FILE = path.join(process.env.TV_CACHE_DIR || path.join(process.cwd(), '.cache'), 'tv-videos.json');
let loaded = false;

async function loadFile() {
  if (loaded) return;
  loaded = true;
  try {
    const j = JSON.parse(await fs.readFile(FILE, 'utf8')) as Record<string, Resolved>;
    for (const [k, v] of Object.entries(j)) if (!mem.has(k)) mem.set(k, v);
  } catch {
    /* no cache yet */
  }
}
async function saveFile() {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(Object.fromEntries(mem), null, 1));
  } catch {
    /* read-only hosting: memory cache still works */
  }
}

const keyOf = (f: FilmEntry) => (f.tmdbId ? `tmdb:${f.tmdbId}` : `t:${norm(f.title)}|${f.year ?? ''}`);

/** The video (or null) for one diary film, from cache when fresh. */
export async function resolveFilmVideo(film: FilmEntry): Promise<Resolved> {
  await loadFile();
  const k = keyOf(film);
  const hit = mem.get(k);
  if (hit && Date.now() - hit.at < (hit.video ? TTL_FOUND : TTL_MISSING)) return hit;
  if (inflight.has(k)) return inflight.get(k)!;
  const job = (async () => {
    let out: Resolved = { video: null, at: Date.now() };
    try {
      const t = await viaTmdb(film);
      out = { ...t, at: Date.now() };
    } catch {
      /* TMDB missing or down: try YouTube */
    }
    if (!out.video) {
      try {
        out.video = await viaYoutube(film);
      } catch {
        /* leave null → poster */
      }
    }
    // keep a previously verified video if this attempt failed for network reasons
    if (!out.video && hit?.video) out = { ...hit, at: Date.now() - TTL_FOUND + DAY };
    mem.set(k, out);
    await saveFile();
    return out;
  })().finally(() => inflight.delete(k));
  inflight.set(k, job);
  return job;
}
