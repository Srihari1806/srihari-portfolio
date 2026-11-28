// /work — the 4 km sunset road trip. Everything a visitor reads lives here
// (case studies live in ./caseStudies.ts), so copy and links change without touching components.
//
// Speakers:  me   = Srihari, plain English, a little witty
//            bike = engineering brain: experiments, code, data, debugging, deploys. Witty technical English.
//            car  = product brain: users, research, strategy, validation. Plain, clever English.
// Keep every message under 20 words. Empty hrefs ('') never render as fake links.

export const contact = {
  email: 'srihari.builds@gmail.com', // TODO verify — same address as the homepage
  linkedin: '', // TODO add your LinkedIn profile URL
  github: 'https://github.com/srihari1806', // TODO verify username
  resume: '/resume.pdf',
};

/** Optional roadside radio. Paste a Spotify *embed* URL (open.spotify.com/embed/...) to show the button.
 *  It never autoplays — the player only loads after the visitor presses play. */
export const radio = {
  label: 'Roadside radio',
  spotifyEmbed: '', // e.g. 'https://open.spotify.com/embed/track/XXXX'
};

export type Speaker = 'me' | 'bike' | 'car';
export type Msg = { who: Speaker; text: string; plain?: string };
export type Reply = { label: string; href?: string; next?: string; scrollTo?: string };
export type Exchange = { lines: Msg[]; replies?: Reply[] };

export const vehicles = {
  bike: {
    name: 'The Bike',
    role: 'Engineering',
    explain: 'Experiments, code, data, debugging and deploys. Fast, slightly overconfident, always shipping.',
  },
  car: {
    name: 'The Car',
    role: 'Product thinking',
    explain: 'Research, user needs, strategy and validation. Calm, and annoyingly good at asking whether it’s worth building.',
  },
};

/* ---------------- missions (one per kilometre) ---------------- */
export const missions: Record<number, { title: string; sky: string }> = {
  4: { title: 'Mission start', sky: 'Dusty-rose sunset' },
  3: { title: 'Billboard alley', sky: 'Golden hour' },
  2: { title: 'The merge', sky: 'Burnt-coral sunset' },
  1: { title: 'Creative side quest', sky: 'Twilight' },
  0: { title: 'Final destination', sky: 'Evening' },
};

/* ---------------- conversations ----------------
   One exchange plays at a time. `next` branches to another exchange, `scrollTo` jumps to a section,
   `href` opens a link. */
export const chats = {
  start: {
    lines: [
      { who: 'me', text: 'Here to inspect my work? Fair enough. I brought receipts.' },
      { who: 'bike', text: 'Engine initialized. Curiosity running in production.', plain: 'He can’t stop asking questions.' },
    ],
  },
  cricfield: {
    lines: [
      { who: 'me', text: 'Slow down here — CricField took a lot of late-night IPL debugging.' },
      { who: 'bike', text: 'Cricket has enough static scoreboards. We built a Pressure Lab.' },
      { who: 'me', text: 'Exactly. It ranks players in custom match crises, not just flat averages.' },
      { who: 'bike', text: 'Data pipeline tuned. Fans get answers, not just box scores.' },
    ],
  },
  hiremap: {
    lines: [
      { who: 'me', text: 'Speed-breaker ahead! Easy on the suspension — HireMap stop.' },
      { who: 'bike', text: 'Job seekers opening 14 browser tabs just to apply for one role?' },
      { who: 'me', text: 'Painful reality. In this team build, I engineered the React and TypeScript front end.' },
      { who: 'bike', text: 'Connected the ATS checker, resume builder, and job matching into one cohesive flow.' },
    ],
  },
  cinephile: {
    lines: [
      { who: 'me', text: 'Another hump! Welcome to Cinephile — where passion meets the box office.' },
      { who: 'bike', text: 'Watching films is fun. Modeling theatrical window economics is obsessive.' },
      { who: 'me', text: 'I love cinema, but I wanted to explore why films win in theatres yet struggle on OTT.' },
      { who: 'bike', text: 'Tested release campaigns and projection windows — purely illustrative scenarios, no fake profits!' },
    ],
  },
  builds: {
    lines: [
      { who: 'bike', text: 'Three speed-breakers cleared. Three real products running live.', plain: 'All three shipped.' },
      { who: 'me', text: 'Solid engineering foundation. But wait… who is that waiting up ahead?' },
    ],
  },
  merge: {
    lines: [
      { who: 'bike', text: 'Clear straight ahead! We can accelerate and ship five more features.' },
      { who: 'car', text: 'Hold on. Before you step on the gas, who actually needs those features?' },
      { who: 'bike', text: 'Requirements check in progress… Wait, who invited the product manager?' },
      { who: 'me', text: 'And right at 2 KM, product judgment joins engineering velocity.' },
    ],
    replies: [
      { label: 'Ship fast and break things', next: 'speed' },
      { label: 'Validate user pain first', next: 'judgment' },
    ],
  },
  speed: {
    lines: [
      { who: 'bike', text: 'Deployed to production in record time! Active daily users: zero.', plain: 'Fast. Also useless.' },
      { who: 'car', text: 'Shipping at 100 km/h in the wrong direction is still going nowhere.' },
    ],
    replies: [{ label: 'So… balance both?', next: 'both' }],
  },
  judgment: {
    lines: [
      { who: 'car', text: 'Conducted 40 user interviews over four months. Thorough discovery.' },
      { who: 'bike', text: 'Total working prototypes shipped during that time: 0.', plain: 'Nothing got built.' },
    ],
    replies: [{ label: 'So… balance both?', next: 'both' }],
  },
  both: {
    lines: [
      { who: 'car', text: 'Validate genuine user friction, define the core metrics, and test hypotheses.' },
      { who: 'bike', text: 'Then architect cleanly, code with high standards, and ship iteratively.' },
      { who: 'me', text: 'Fast prototypes backed by clear product intent. That’s the lane I drive in.' },
    ],
  },
  cinema: {
    lines: [{ who: 'me', text: 'You’ve seen what I build. But did I mention I write songs?' }],
    replies: [{ label: 'Wait, really?', next: 'cinemaReally' }],
  },
  cinemaReally: {
    lines: [{ who: 'me', text: 'Yeah. Apparently one department wasn’t enough.' }],
  },
  arrival: {
    lines: [
      { who: 'bike', text: 'Destination reached. Build successful.' },
      { who: 'car', text: 'And the outcome?' },
      { who: 'bike', text: 'Awaiting recruiter response.', plain: 'Waiting on you.' },
      { who: 'me', text: 'Well, that’s your cue.' },
    ],
  },
} satisfies Record<string, Exchange>;
export type ChatId = keyof typeof chats;

/* ---------------- 4 KM · mission start ---------------- */
export const intro = {
  km: 4,
  title: 'Oh, you’re here.',
  subtitle: 'Four kilometres. A few projects. One unexpected passenger.',
  cta: 'Start the ride',
  billboard: 'Caution: this guy turns questions into projects.',
};

/* ---------------- 3 KM · three real products ----------------
   Screenshots are real captures of the live sites (public/projects/). `features` only lists what is
   visible on the live site — keep it that way. `caseStudy` / `code` show a button once filled in. */
export type Project = {
  key: 'cricfield' | 'hiremap' | 'cinephile';
  name: string;
  kind: string;
  headline: string;
  line: string;
  image: string;
  imageAlt: string;
  live: string;
  caseStudy: string;
  code: string;
  problem: string;
  features: string[];
  role: string;
  takeaway: string;
  note?: string;
};

export const builds = {
  km: 3,
  kicker: '3 km · Billboard alley',
  title: 'Three products. All live.',
  projects: [
    {
      key: 'cricfield',
      name: 'CricField',
      kind: 'Cricket intelligence',
      headline: 'Cricket has enough scoreboards. I wanted answers.',
      line: 'IPL analytics, scouting and a Pressure Lab that ranks players in situations you define.',
      image: '/projects/cricfield.jpg',
      imageAlt: 'CricField Pressure Lab: a situation builder beside a ranked table of IPL batters',
      live: 'https://www.cricfield.in/',
      caseStudy: '/work/cricfield',
      code: 'https://github.com/CRICFIELD-INTELLIGENGE/IPL-ANALYTICAL-ENGINE',
      problem: 'Cricket coverage tells you what happened. I wanted somewhere to ask why, and what if.',
      features: [
        'Pressure Lab: define a match situation, rank players by how they perform in it',
        'Scout Lab: discover players and compare roles',
        'Auction room: purse, slots and the player pool',
        'Squad HQ: retentions, releases and squad building',
        'Match Lab: playing XI and tactics',
        'Venue Atlas: grounds, conditions and history',
      ],
      role: 'Founder build: data, design, code and launch.',
      takeaway: 'Demonstrates end-to-end data product ownership: custom situational metrics, responsive UI design, and full deployment from scratch.',
    },
    {
      key: 'hiremap',
      name: 'HireMap',
      kind: 'AI career platform',
      headline: 'Job hunting has enough tabs. Let’s connect the dots.',
      line: 'Resume builder, ATS checker, cover letters, job matching and a career map, in one place.',
      image: '/projects/hiremap.jpg',
      imageAlt: 'HireMap toolbox: AI resume builder, cover letter, ATS checker, career map and job matching',
      live: 'https://hiremap-eight.vercel.app/',
      caseStudy: '/work/hiremap',
      code: '',
      problem: 'Students juggle half a dozen tools to apply for a single job.',
      features: [
        'AI resume builder with ATS-friendly templates',
        'ATS checker with keyword fixes',
        'Cover letter generator',
        'Job matching with a skill-match score',
        'Career map and role roadmaps',
        'Portals for companies and colleges',
      ],
      role: 'Team build. I worked on the front end: React, TypeScript and Firebase.',
      takeaway: 'Shows strong frontend collaboration: translating multi-step user workflows into modular TypeScript components and seamless UX.',
    },
    {
      key: 'cinephile',
      name: 'Cinephile',
      kind: 'CineVerse · entertainment intelligence',
      headline: 'Love cinema. Curious about the business behind it.',
      line: 'Film discovery, release campaigns, audience intelligence and OTT-vs-theatre economics.',
      image: '/projects/cinephile.jpg',
      imageAlt: 'CineVerse home: “Two screens. One story.” over a cinema hall',
      live: 'https://cinephile-theatre.vercel.app/',
      caseStudy: '/work/cinephile',
      code: '',
      problem: 'A film can win in cinemas and struggle on streaming. I wanted to see why.',
      features: [
        'Film Universe: films, directors, composers and studios',
        'Craft Lab: StoryDNA, FrameLab, CutLab and SoundLab',
        'Campaign War Room: GTM plans and a budget simulator',
        'Projection Lab: theatre vs streaming and release windows',
        'Producer’s Office: greenlight risk, release clashes, window wars',
        'Cinema Journal: essays and box-office post-mortems',
      ],
      role: 'Concept, research and build.',
      note: 'Box-office and OTT figures on the site are illustrative scenarios, not audited financial records.',
      takeaway: 'Highlights commercial product thinking and domain curiosity: modeling release dynamics and scenario exploration with immersive storytelling.',
    },
  ] as Project[],
};

/* ---------------- 2 KM · the merge ---------------- */
export const merge = {
  km: 2,
  kicker: '2 km · A car joins from the side road',
  title: 'Fast is good. Right is better. Both? Now we’re talking.',
};

/* ---------------- 1 KM · creative side quest ----------------
   `image` = real artwork (public/creative/…); without it the poster is pure typography.
   `uses` = where the creative work meets the day job. */
export type Exhibit = { key: string; title: string; tag: string; line: string; uses: string[]; image?: string; href: string };

export const creative = {
  km: 1,
  kicker: '1 km · Creative side quest',
  title: 'Now showing: the other side.',
  exhibits: [
    {
      key: 'kalakshetra',
      title: 'Kalakshetra / Desi Muchhatlu',
      tag: 'Independent music',
      line: 'Independent cultural ventures: event concepts, branding, artist collaborations and audience strategy.',
      uses: ['Branding', 'Audience strategy', 'Partnerships'],
      href: 'https://band-premier-league.vercel.app/',
    },
    {
      key: 'sahitya',
      title: 'Sahitya Rachanalu',
      tag: 'Writing community',
      line: 'Original lyrics, poetry, songwriting and creative publishing. I founded it.',
      uses: ['Writing', 'Community', 'Publishing'],
      href: 'https://sahitya-rachanalu.vercel.app/',
    },
    {
      key: 'songs',
      title: 'Original music',
      tag: 'Songs & credits',
      line: 'Alaka Yelanani, Dil Bezubaan and other published creative contributions.',
      uses: ['Songwriting', 'Storytelling', 'Release'],
      href: 'https://linktr.ee/Srihari1806',
    },
  ] as Exhibit[],
  cta: { label: 'Explore my creative side', href: '/creative' },
};

/* ---------------- 0 KM · final destination ---------------- */
export const destination = {
  kicker: '0 km · Final destination',
  reveal: 'Different engines. Same driver.',
  revealLine: 'One likes making things work. The other asks whether they’re worth building.',
  ask: 'You’ve seen my work. Want to tell me about yours?',
  door: 'Knock, knock',
  inside: 'Come in.',
  roles: 'Product Analyst · Data Analyst · Business & Growth Analyst · APM · Sports analytics',
  signoff: 'Mission complete. Recruiter response pending.',
};

/* ---------------- witty roadside signs (desktop, in the bends) ---------------- */
export const signs: Record<string, string> = {
  'build-hiremap': 'Speed limit|One idea per km',
  'build-cinephile': 'U-turns allowed|We call it iterating',
  creative: 'Detour|Creative side',
  destination: 'Last exit|Interview room',
};

export type DiscoveryKey = 'start' | 'products' | 'studies' | 'decision' | 'creative' | 'door';
