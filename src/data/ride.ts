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

export type StopKey = 'vizag' | 'product' | 'cricket' | 'cinema' | 'lab' | 'human' | 'home';
export type Stop = {
  key: StopKey;
  name: string;
  line: string;
  /** what the window shows when the train pulls in; '' = the painted view itself */
  view: string;
  viewAlt: string;
  href: string;
  external?: boolean;
  cta: string;
};

/* The window shows each page as it really looks (screenshots in public/ride/stops/). Retake them after a
   page changes: open the page at 1280 × 800 and save the screenshot over the old file. */
export const stops: Stop[] = [
  { key: 'vizag', name: 'Vizag', line: 'Where it began', view: '', viewAlt: '', href: '', cta: '' },
  {
    key: 'product',
    name: 'Product',
    line: 'What I build',
    view: '/ride/stops/work.webp',
    viewAlt: 'The work page: a sunset road trip through my projects',
    href: '/work',
    cta: 'Get off at Work',
  },
  {
    key: 'cricket',
    name: 'Cricket',
    line: 'What I analyse',
    view: '/projects/cricfield.jpg',
    viewAlt: 'CricField Pressure Lab: a situation builder beside a ranked table of IPL batters',
    href: 'https://www.cricfield.in/',
    external: true,
    cta: 'Open CricField',
  },
  {
    key: 'cinema',
    name: 'Cinema',
    line: 'What I love',
    view: '/ride/stops/cinema.webp',
    viewAlt: 'The cinema page: an old single-screen theatre you can walk into',
    href: '/cinema',
    cta: 'Get off at Cinema',
  },
  {
    key: 'lab',
    name: 'Lab',
    line: 'What I explore',
    view: '/ride/stops/lab.webp',
    viewAlt: 'The lab page: the workbench is being set up',
    href: '/lab',
    cta: 'Get off at the Lab',
  },
  {
    key: 'human',
    name: 'Human',
    line: 'Behind the terminal',
    view: '/ride/stops/human.webp',
    viewAlt: 'The human page: meet the person behind the terminal',
    href: '/human',
    cta: 'Get off at Human',
  },
  {
    key: 'home',
    name: 'Home',
    line: 'Last stop',
    view: '/ride/stops/home.webp',
    viewAlt: 'The homepage',
    href: '/',
    cta: 'Step off here',
  },
];

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
  { key: 'ball', label: 'Cricket', box: [356, 262, 410, 330], stop: 'cricket' },
  { key: 'bowler', label: 'Cricket', box: [333, 368, 412, 438], stop: 'cricket' },
  { key: 'code', label: 'What I build', box: [322, 466, 424, 516], stop: 'product' },
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
