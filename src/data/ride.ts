/* The train ride: the loading screen and the window journey that opens the portfolio.
   Everything here is content or coordinates; the engine lives in src/components/ride/. */

import { nowPlaying } from './home';

/** Cabin artwork (public/ride/cabin.webp) is 1536 × 864. Boxes are [x0, y0, x1, y1] in its pixels. */
export type Box = readonly [number, number, number, number];
export const CABIN = { w: 1536, h: 864, src: '/ride/cabin.webp' } as const;

/** the big window's glass, inside its brass rim */
export const windowGlass: Box = [457, 230, 1081, 616];
export const windowRadius = 30;
/** the door windows and the two cut-off windows at the edges: they go dark in tunnels too */
export const sideWindows: Box[] = [
  [119, 170, 264, 540],
  [1278, 170, 1424, 540],
  [0, 170, 48, 541],
  [1491, 170, 1536, 541],
];
/** green LED board mounted above the window, under the luggage rack */
export const ledBoard: Box = [560, 201, 976, 226];

export type StopKey = 'vizag' | 'work' | 'cinema' | 'lab' | 'human';
export type Stop = {
  key: StopKey;
  name: string;
  line: string;
  /** where the landmark stands in the world (main-layer px; the window is 624 wide) */
  x: number;
  /** destination page; '' for the starting view */
  href: string;
  cta: string;
  /** where the camera dives in, in window px, when the window is centred on the landmark */
  focus: readonly [number, number];
  /** the colours the destination's first screen opens with: the dive hands over on these */
  cover: string;
};

export const stops: Stop[] = [
  { key: 'vizag', name: 'Vizag', line: 'Where it began', x: 430, href: '', cta: '', focus: [312, 230], cover: '' },
  {
    key: 'work',
    name: 'Work',
    line: 'What I build',
    x: 2000,
    href: '/work',
    cta: 'Enter Work',
    focus: [312, 292],
    cover: 'linear-gradient(#5d3b4a, #a8606a 45%, #f3ad7c)',
  },
  {
    key: 'cinema',
    name: 'Cinema',
    line: 'What I love',
    x: 3600,
    href: '/cinema',
    cta: 'Enter Cinema',
    focus: [312, 250],
    cover: 'linear-gradient(#95a3a0, #6f7f5a 55%, #c9a679)',
  },
  {
    key: 'lab',
    name: 'Lab',
    line: 'What I explore',
    x: 5150,
    href: '/lab',
    cta: 'Enter the Lab',
    focus: [300, 214],
    cover: 'radial-gradient(ellipse at 50% 40%, #59201a, #2a120f 75%)',
  },
  {
    key: 'human',
    name: 'About',
    line: 'Behind the terminal',
    x: 6700,
    href: '/about',
    cta: 'Enter About',
    focus: [300, 190],
    cover: 'linear-gradient(#f7f2ea, #efe3d2)',
  },
];
export const stopByHref = (path: string) => stops.find((s) => s.href && (path === s.href || path.startsWith(`${s.href}/`)));

/** the five stations printed on the loading screen (from the loading-screen design) */
export const timeline = [
  { key: 'vizag', name: 'Vizag', line: 'Where it began' },
  { key: 'cinema', name: 'Cinema', line: 'What I love' },
  { key: 'cricket', name: 'Cricket', line: 'What I analyse' },
  { key: 'product', name: 'Product', line: 'What I build' },
  { key: 'beyond', name: 'Beyond', line: 'What I explore' },
] as const;

/** things in the cabin you can click: jump to a stop, or open a link */
export const cabinSpots: { key: string; label: string; box: Box; stop?: StopKey; href?: string }[] = [
  { key: 'ball', label: 'CricField · Work', box: [356, 262, 410, 330], stop: 'work' },
  { key: 'bowler', label: 'CricField · Work', box: [333, 368, 412, 438], stop: 'work' },
  { key: 'code', label: 'What I build', box: [322, 466, 424, 516], stop: 'work' },
  { key: 'ticket', label: 'Cinema', box: [1124, 340, 1218, 408], stop: 'cinema' },
  { key: 'music', label: 'Music', box: [1120, 420, 1228, 468], href: nowPlaying.href },
  { key: 'lighthouse', label: 'Vizag', box: [1130, 488, 1238, 572], stop: 'vizag' },
  { key: 'notebook', label: 'Writing', box: [330, 684, 444, 796], href: '/writing' },
  { key: 'camera', label: 'Creative work', box: [764, 92, 852, 156], href: '/creative' },
];
/** the speaker panel with the red light: train sound on/off */
export const speaker: Box = [1123, 281, 1225, 318];

export const rideCopy = {
  kicker: 'A journey through my world',
  start: 'Start Ride',
  hint: 'Scroll to begin the journey',
  loading: 'Loading my world…',
  skip: 'Skip the ride',
  boarding: 'Boarding',
} as const;
