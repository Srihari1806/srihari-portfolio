// Shapes shared by the live-data API routes and the room.

export type LiveSource = 'live' | 'cached' | 'unavailable';

export type FilmEntry = {
  title: string;
  year?: string;
  rating?: number; // 0.5 – 5, only when you rated it
  poster?: string;
  url: string;
  watched?: string; // YYYY-MM-DD
  tmdbId?: number;
  review?: string; // your Letterboxd review text, when the entry has one
};

/** An official YouTube video chosen for a diary film (verified embeddable on the server). */
export type TvVideo = { id: string; name: string; kind: 'trailer' | 'teaser' | 'song'; via: 'tmdb' | 'youtube' };
export type TvFilm = FilmEntry & { video: TvVideo | null };
export type TvFeed = { source: LiveSource; films: TvFilm[]; fetchedAt?: string; reason?: string };
export type FilmFeed = { source: LiveSource; entries: FilmEntry[]; fetchedAt?: string; reason?: string };

export type Track = {
  title: string;
  artist: string;
  album?: string;
  art?: string;
  url: string;
  playing: boolean; // true only when Spotify says it's playing right now
  progressMs?: number;
  durationMs?: number;
  playedAt?: string;
};
export type TrackFeed = { source: LiveSource; track: Track | null; fetchedAt?: string; reason?: string };
