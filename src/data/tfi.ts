// TFI Mode (night) homepage — the illustrated room.
// Everything here is in the artwork's own pixel space (1672 × 941). Hotspots and overlays are
// positioned in % of that box, so they stay glued to the illustration at every screen size.
//
// Nothing dynamic is baked into the artwork: live Spotify / Letterboxd data and any photos you set
// below are drawn on top. Leave a value empty ('' or []) and the room shows its original illustration.

import { filmDiary, nowPlaying } from './home';

export const ROOM = { w: 1672, h: 941 };

export type Box = [x0: number, y0: number, x1: number, y1: number];
/** four corners, clockwise from the top-left of the *content* (for things drawn at an angle) */
export type Quad = [[number, number], [number, number], [number, number], [number, number]];

/* ---------------- comic stickers ----------------
   The sticker art itself is cut out of the illustration (src/assets/tfi/sticker-*.webp), so it looks
   identical at rest. `label`/`sub` are the accessible names; `href` is where each one goes. */
export type StickerKey = 'work' | 'cinema' | 'play' | 'write' | 'music';
/** what the boy is doing: each is a separately drawn shot (see `character` below) */
export type PoseKey = 'rug' | 'desk' | 'tv' | 'sleep';
// `pose`: hovering or focusing this sticker/object cuts to that shot (clicking still navigates)
export const stickers: { key: StickerKey; label: string; sub: string; href: string; box: Box; pose?: PoseKey }[] = [
  { key: 'work', label: 'Work', sub: 'Projects · Builds · More', href: '/work', box: [244, 122, 424, 246], pose: 'desk' },
  { key: 'cinema', label: 'Cinema', sub: 'Watches · Reviews · Lists', href: '/cinema', box: [240, 448, 462, 614], pose: 'tv' },
  { key: 'play', label: 'Play', sub: 'Experiments · Lab · Fun', href: '/playground', box: [1152, 508, 1352, 630], pose: 'rug' },
  { key: 'write', label: 'Write', sub: 'Notes · Scripts · Ideas', href: '/writing', box: [1166, 684, 1350, 804], pose: 'rug' },
  { key: 'music', label: 'Music', sub: 'On repeat · Playlists', href: '#tfi-player', box: [346, 806, 532, 920], pose: 'rug' },
];

/* ---------------- clickable objects in the room ---------------- */
export const objects: { key: string; label: string; href?: string; action?: 'calendar'; box: Box; pose?: PoseKey }[] = [
  { key: 'laptop', label: 'Laptop — open my work', href: '/work', box: [380, 150, 528, 318], pose: 'desk' },
  { key: 'tv', label: 'TV — cinema, watches and reviews', href: '/cinema', box: [30, 360, 262, 762], pose: 'tv' },
  { key: 'calendar', label: 'Desk calendar — open the full calendar', action: 'calendar', box: [590, 194, 652, 266], pose: 'desk' },
  { key: 'notebook', label: 'Notebook — writing', href: '/writing', box: [868, 640, 1110, 812], pose: 'rug' },
];

/* ---------------- the boy ---------------- */
// Closed-eye patch (src/assets/tfi/blink.png) for the boy baked into room.webp. Used only until the
// separate pose artwork exists (src/data/tfiPoses.json, made by scripts/tfi-poses/ingest.py).
export const blinkBox: Box = [714, 450, 790, 478];
export const character: {
  /** rug shot: his face, lit by the phone he's scrolling (we see the phone's back, so the light is the tell) */
  screenGlow: Box | null;
  /** where each shot sits, so phones can pan the room to it after a cut */
  centreX: Record<PoseKey, number>;
} = {
  screenGlow: [692, 424, 812, 534],
  centreX: { rug: 790, desk: 430, tv: 1500, sleep: 1500 },
};

/* ---------------- TV: Letterboxd → official YouTube videos ----------------
   Set your Letterboxd username here (or LETTERBOXD_USERNAME in .env.local). The server reads your public
   diary feed, takes the latest three films (with their TMDB ids) and finds an official trailer / teaser /
   song for each:
     TMDB_API_KEY      (or TMDB_READ_TOKEN)  — required: TMDB's official video list for each film
     YOUTUBE_API_KEY                          — optional: a strict YouTube search when TMDB has nothing
   Picks are verified as embeddable and cached in .cache/tv-videos.json. Until the username is set the TV
   keeps the illustration's own posters, and its label says so. Nothing is hardcoded. */
export const letterboxd = {
  username: 'srihari_06', // public Letterboxd diary
  profileUrl: 'https://letterboxd.com/srihari_06/',
  /** the TV screen inside the bezel, as drawn */
  screen: [
    [34, 542],
    [238, 360],
    [262, 612],
    [52, 762],
  ] as Quad,
  /** optional: your own 3 poster images (public/…) to show when Letterboxd isn't connected */
  fallbackPosters: [] as { title: string; poster: string; rating?: number }[],
};

/* ---------------- console: Spotify ----------------
   Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN in .env.local
   (scopes: user-read-currently-playing user-read-recently-played). Without them the console keeps the
   illustrated track and the player opens your Spotify link instead. */
export const spotify = {
  profileUrl: nowPlaying.href,
  player: [556, 862, 1142, 930] as Box,
  art: [647, 870, 696, 919] as Box,
  text: [712, 869, 892, 908] as Box,
  progress: [714, 912, 888, 919] as Box,
  button: [990, 874, 1030, 914] as Box,
  /** colours sampled from the artwork so live text sits on the same panel */
  panel: '#211b17',
};

/* ---------------- wall photographs ----------------
   Put a path (e.g. '/tfi/my-photo.jpg' in public/) to replace a photo; leave '' to keep the illustration. */
export const wallPhotos: { key: string; label: string; src: string; quad: Quad }[] = [
  {
    key: 'poster',
    label: 'Poster on the wall',
    src: '',
    quad: [
      [148, 166],
      [197, 219],
      [181, 352],
      [125, 297],
    ],
  },
  {
    key: 'portrait',
    label: 'Framed portrait on the shelf',
    src: '',
    quad: [
      [1100, 82],
      [1207, 80],
      [1209, 195],
      [1102, 198],
    ],
  },
  {
    key: 'snapshot',
    label: 'Small photo on the shelf',
    src: '',
    quad: [
      [1117, 226],
      [1184, 226],
      [1184, 268],
      [1117, 268],
    ],
  },
];

/* ---------------- calendar ----------------
   Opens from the little desk calendar. Add confirmed release dates and your own movie plans here.
   date: 'YYYY-MM-DD'. Only add releases that are officially dated. */
export type CalendarEvent = { date: string; title: string; kind: 'release' | 'personal'; note?: string };
export const calendarEvents: CalendarEvent[] = [];
