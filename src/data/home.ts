// Content for the Normal Mode homepage.
// Links marked TODO are placeholders carried over from the existing site — verify before launch.

import { links } from './profile';

export const navLinks = [
  { label: 'home', href: '/' },
  { label: 'work', href: '/work' },
  { label: 'lab', href: '/lab' },
  { label: 'cinema', href: '/cinema' },
  { label: 'about', href: '/about' },
] as const;

export const contactHref = `mailto:${links.email}`; // address lives in ./profile.ts

export const hero = {
  eyebrow: 'Electronics & Computer Science · Class of 2027',
  description:
    'I build products with engineering, uncover insights through data, and communicate ideas through storytelling. Exploring the intersection of software, AI, analytics and product strategy.',
  handNote: ['code', 'cricket', 'cinema', 'circuits', 'and a lot of', 'memes :)'],
  // Mobile layout uses its own copy (from the approved mobile mock-up).
  eyebrowMobile: 'ECS · Class of 2027',
  descriptionMobile:
    'I build products with engineering, uncover insights through data, and communicate ideas through storytelling.',
  handNoteMobile: ['code', 'circuits', 'cricket', 'cinema', 'memes :)'],
};

export const featuredProject = {
  name: 'CricField',
  tagline: 'Sports intelligence platform for cricket — from data to decisions.',
  tags: ['Data Engineering', 'ML', 'Product', 'Cricket'],
  taglineMobile: 'Cricket intelligence platform from data to decisions.',
  tagsMobile: ['Data', 'ML', 'Product', 'Cricket'],
  href: 'https://cricfield.in',
  caseStudyHref: '/work/cricfield',
  // Illustrative mock-up values shown on the card artwork, not real platform metrics.
  mockMetrics: { playerImpact: '+0.42', runRate: '8.36', wicketProb: '27%' },
};

export const nowPlaying = {
  track: 'Evening Drive',
  artist: 'The Nearabouts',
  elapsed: '2:16',
  duration: '4:08',
  progress: 0.55,
  // Demo state until a Spotify integration is authenticated.
  isDemo: true,
  href: 'https://open.spotify.com/', // TODO link to your profile/playlist
};

export const filmDiary = {
  // Sample layout with placeholder stills — not my real diary. The live Letterboxd diary is on /cinema.
  isDemo: true,
  average: '4.5',
  href: 'https://letterboxd.com/', // TODO link to your Letterboxd diary
  films: [
    { title: 'Lighthouse', rating: 4 },
    { title: 'Golden Hour', rating: 5 },
    { title: 'The Archway', rating: 3.5 },
  ],
};

export const memeCorner = {
  title: 'Meme corner',
  text: 'A small space for memes, GIFs, cricket edits and other questionable humour.',
  href: '/playground',
};

export const lab = {
  title: 'Electronics lab',
  text: 'Circuits, embedded systems and random hardware experiments.',
  href: '/lab',
};

// Mobile bottom tab bar — anchors point at the phone-only sections.
export const mobileTabs = [
  { key: 'cse', label: 'CSE', href: '/work' },
  { key: 'electronics', label: 'Electronics', href: '/lab' },
  { key: 'cricket', label: 'Cricket', href: '/work/cricfield' },
  { key: 'cinema', label: 'Cinema', href: '/cinema' },
  { key: 'music', label: 'Music', href: links.sahitya },
  { key: 'memes', label: 'Memes', href: '#memes-m' },
] as const;

export const interests = [
  // every interest opens in the same tab; `role` also tunes the site for that role family
  { key: 'cse', label: 'CSE / Software', note: ['AI', 'Data', 'Web'], href: '/work', role: 'software' },
  { key: 'electronics', label: 'Electronics', note: ['Circuits', 'Embedded'], href: '/lab', role: null },
  { key: 'cricket', label: 'Cricket', note: ['Analytics', 'Scouting'], href: '/work/cricfield', role: 'data' },
  { key: 'cinema', label: 'Cinema', note: ['Films', 'Writing', 'Edits'], href: '/cinema', role: 'business' },
  { key: 'music', label: 'Music', note: ['Lyrics', 'Songs'], href: links.sahitya, role: null },
] as const;

export const footer = {
  intro: 'A personal space for everything I build, watch, listen to, play and overthink.',
  currentlyBuilding: 'CricField',
  next: 'a cine-log, a new hardware build, and probably another meme page.',
};
