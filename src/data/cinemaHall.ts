// /cinema — "Srihari Talkies", a single-screen theatre you walk through.
// Everything a visitor reads is here. Empty lists show an honest "coming soon" state — never sample content.
// Shared data lives elsewhere on purpose:
//   • release calendar  → calendarEvents in src/data/tfi.ts (same as the desk calendar in the room)
//   • recent watches    → your Letterboxd feed via /api/tv (posters, ratings, verified official trailers)
//   • now playing       → Spotify via /api/spotify
//   • ventures          → creative.exhibits in src/data/roadtrip.ts

import { nowPlaying } from './home';

export const hall = {
  name: 'Srihari Talkies',
  telugu: 'శ్రీహరి టాకీస్',
  tagline: 'Air cooled · 70MM · Since forever',
  nowShowing: ['My cinema side', '4 shows daily'],
};

export type StopKey = 'counter' | 'corridor' | 'auditorium' | 'booth' | 'credits';
export const stops: { key: StopKey; title: string; sub: string }[] = [
  { key: 'counter', title: 'Ticket counter', sub: '12 months of releases' },
  { key: 'corridor', title: 'Poster corridor', sub: 'Recent watches' },
  { key: 'auditorium', title: 'Auditorium', sub: 'Essays & reviews' },
  { key: 'booth', title: 'Projection booth', sub: 'Music & made things' },
  { key: 'credits', title: 'Post-credits', sub: 'Stay till the end' },
];

/* ---------------- one short conversation per stop ----------------
   who: 'me' (Srihari) · 'usher' · 'booth' (the projectionist). Keep lines under ~15 words. */
export type Who = 'me' | 'usher' | 'booth';
export const chats: Record<StopKey, { who: Who; text: string }[]> = {
  counter: [
    { who: 'usher', text: 'How many tickets?' },
    { who: 'me', text: 'Twelve. One for every month.' },
    { who: 'usher', text: 'That is… not how tickets work.' },
  ],
  corridor: [
    { who: 'usher', text: 'Your posters?' },
    { who: 'me', text: 'My latest watches. Every rating is mine — no paid reviews.' },
  ],
  auditorium: [
    { who: 'usher', text: 'Phones off, please.' },
    { who: 'me', text: 'Relax. It’s an essay, not a call.' },
  ],
  booth: [
    { who: 'booth', text: 'Nobody’s allowed in the booth.' },
    { who: 'me', text: 'I wrote some of the songs.' },
    { who: 'booth', text: '…Mind the reels.' },
  ],
  credits: [
    { who: 'usher', text: 'Show’s over, sir.' },
    { who: 'me', text: 'Not yet. This is a Telugu film — wait for the post-credit scene.' },
  ],
};

/* ---------------- auditorium: writing on the big screen ----------------
   Add published pieces only. kind: 'essay' | 'x-article' | 'review' | 'analysis'. */
export type Piece = { title: string; kind: 'essay' | 'x-article' | 'review' | 'analysis'; url: string; date?: string; blurb?: string };
export const writing: Piece[] = [];

/* ---------------- projection booth ----------------
   url '' renders as "link soon". Only list things that exist. */
export type BoothItem = { title: string; note?: string; url: string };
export const booth = {
  spotifyProfile: nowPlaying.href, // TODO your Spotify artist/profile link (set in src/data/home.ts)
  songs: [
    { title: 'Alaka Yelanani', note: 'Original song', url: '' },
    { title: 'Dil Bezubaan', note: 'Original song', url: '' },
  ] as BoothItem[],
  lyrics: [] as BoothItem[],
  shortFilms: [] as BoothItem[],
  storyboards: [] as BoothItem[],
};

/* ---------------- end credits ---------------- */
export const credits: [role: string, name: string][] = [
  ['Written by', 'Srihari'],
  ['Directed by', 'Srihari'],
  ['Watched, rated and over-analysed by', 'Srihari'],
  ['Music', 'Srihari (and whatever’s on repeat)'],
  ['Popcorn', 'Extra butter'],
  ['No films were harmed', 'Some were rated harshly'],
];

export const postCredits = {
  line: 'Still here? Good. That’s the TFI fan in you.',
  links: [
    { label: 'Read my writing', href: '/writing' },
    { label: 'Hear my music', href: nowPlaying.href },
    { label: 'See my work', href: '/work' },
  ],
};
