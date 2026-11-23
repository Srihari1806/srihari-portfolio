// Content for the Normal Mode homepage.
// Links marked TODO are placeholders carried over from the existing site — verify before launch.

export const navLinks = [
  { label: 'work', href: '/work' },
  { label: 'cinema', href: '/cinema' },
  { label: 'lab', href: '/lab' },
  { label: 'human', href: '/human' },
] as const;

export const contactHref = 'mailto:srihari.builds@gmail.com'; // TODO verify address

export const hero = {
  eyebrow: 'Engineer by degree. Creator by instinct.',
  description:
    'I build with code, think in stories, analyse cricket, and occasionally get lost in cinema.',
  handNote: ['code', 'cricket', 'cinema', 'circuits', 'and a lot of', 'memes :)'],
  // Mobile layout uses its own copy (from the approved mobile mock-up).
  eyebrowMobile: 'Engineer / Creator / Storyteller',
  descriptionMobile:
    'I build with code & circuits, analyze cricket, live in cinema, listen to music, log films, collect memes and create things in between.',
  handNoteMobile: ['code', 'circuits', 'cricket', 'cinema', 'memes :)'],
};

export const featuredProject = {
  name: 'CricField',
  tagline: 'Sports intelligence platform for cricket — from data to decisions.',
  tags: ['Data Engineering', 'ML', 'Product', 'Cricket'],
  taglineMobile: 'Cricket intelligence platform from data to decisions.',
  tagsMobile: ['Data', 'ML', 'Product', 'Cricket'],
  href: 'https://cricfield.in',
  caseStudyHref: 'https://cricfield.in',
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
  href: '/playground',
};

// Mobile bottom tab bar — anchors point at the phone-only sections.
export const mobileTabs = [
  { key: 'cse', label: 'CSE', href: '/work' },
  { key: 'electronics', label: 'Electronics', href: '/lab' },
  { key: 'cricket', label: 'Cricket', href: 'https://cricfield.in' },
  { key: 'cinema', label: 'Cinema', href: '/cinema' },
  { key: 'music', label: 'Music', href: '#music-m' },
  { key: 'memes', label: 'Memes', href: '#memes-m' },
] as const;

export const interests = [
  { key: 'cse', label: 'CSE / Software', note: ['AI', 'Data', 'Web'], href: '/work' },
  { key: 'electronics', label: 'Electronics', note: ['Circuits', 'Embedded'], href: '/lab' },
  { key: 'cricket', label: 'Cricket', note: ['Analytics', 'Scouting'], href: 'https://cricfield.in' },
  { key: 'cinema', label: 'Cinema', note: ['Films', 'Writing', 'Edits'], href: '/cinema' },
  { key: 'music', label: 'Music', note: ['Playlists', 'Discovery'], href: '#music' },
] as const;

export const footer = {
  intro: 'A personal space for everything I build, watch, listen to, play and overthink.',
  currentlyBuilding: 'CricField',
  next: 'a cine-log, a new hardware build, and probably another meme page.',
};
