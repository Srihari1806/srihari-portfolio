import type { FilmEntry } from './live';

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : undefined;
};
const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

/** Parse a Letterboxd member RSS feed. Keeps diary entries only (items with a film title); lists are skipped. */
export function parseLetterboxdRss(xml: string, limit = 3): FilmEntry[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const out: FilmEntry[] = [];
  for (const it of items) {
    const title = tag(it, 'letterboxd:filmTitle');
    if (!title) continue;
    const rating = tag(it, 'letterboxd:memberRating');
    const desc = tag(it, 'description') ?? '';
    const poster = desc.match(/<img[^>]+src="([^"]+)"/)?.[1];
    // the description is the poster + either "Watched on …" or the review itself
    const text = decode(
      desc
        .replace(/<img[^>]*>/g, '')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/p>\s*<p>/g, '\n\n')
        .replace(/<[^>]+>/g, '')
        .trim(),
    );
    const review = text && !/^Watched on /i.test(text) && !/^This review may contain spoilers\.?$/i.test(text) ? text.replace(/^This review may contain spoilers\.\s*/i, '') : undefined;
    out.push({
      title: decode(title),
      year: tag(it, 'letterboxd:filmYear'),
      rating: rating ? Number(rating) : undefined,
      poster: poster ? decode(poster) : undefined,
      url: decode(tag(it, 'link') ?? ''),
      watched: tag(it, 'letterboxd:watchedDate'),
      tmdbId: tag(it, 'tmdb:movieId') ? Number(tag(it, 'tmdb:movieId')) : undefined,
      review,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Fetch a member's public diary feed (cached by Next for 30 minutes). Throws on failure. */
export async function fetchDiary(user: string, limit = 3): Promise<FilmEntry[]> {
  const res = await fetch(`https://letterboxd.com/${encodeURIComponent(user)}/rss/`, {
    next: { revalidate: 1800 },
    headers: { 'User-Agent': 'srihari-portfolio (+room TV)' },
  });
  if (!res.ok) throw new Error(`Letterboxd HTTP ${res.status}`);
  const entries = parseLetterboxdRss(await res.text(), limit);
  if (!entries.length) throw new Error('no diary entries');
  return entries;
}
