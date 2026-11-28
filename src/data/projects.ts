/* ============================================================================
   PROJECTS — the single source for every project on the site (homepage, /work, roles).
   Honesty rules:
   - Screenshots in /public/projects are real captures of the live sites.
   - Only list facts that can be checked: the live site, the repo README, or what I've stated.
   - Empty arrays / strings render nothing. Never fill a field with a guess.
   - Lines marked "TODO verify" are drafted from the live site and need my sign-off.
   ========================================================================== */

export type ProjectStatus = 'live' | 'live-team' | 'prototype';

export type PortfolioProject = {
  key: 'cricfield' | 'hiremap' | 'cinephile';
  name: string;
  title: string;
  kind: string;
  image: string;
  imageAlt: string;
  live: string;
  code: string;
  caseStudy: string;
  status: ProjectStatus;
  statusLabel: string;
  problem: string;
  users: string;
  contribution: string;
  /** set on team projects: what the team built that I did not */
  teamNote?: string;
  focus: string[];
  decisions: string[];
  tech: string[];
  /** verified facts only: measured results, evaluations, or checkable scale */
  evidence: string[];
  limitations: string[];
  /** visible product features (from the live site) */
  features: string[];
  /** case-study chapters. Empty = "being written up" on the project page */
  research: string[];
  implementation: string[];
  lessons: string[];
  /** one line for compact cards */
  oneLiner: string;
  capabilities: string[];
};

export const projects: PortfolioProject[] = [
  {
    key: 'cricfield',
    name: 'CricField',
    title: 'Cricket Intelligence Platform',
    kind: 'Founder build · end-to-end',
    image: '/projects/cricfield.jpg',
    imageAlt: 'CricField Pressure Lab: a situation builder beside a ranked table of IPL batters',
    live: 'https://www.cricfield.in/',
    code: 'https://github.com/CRICFIELD-INTELLIGENGE/IPL-ANALYTICAL-ENGINE',
    caseStudy: '',
    status: 'live',
    statusLabel: 'Live · actively developed',
    problem: 'Cricket coverage tells you what happened. I wanted a place to ask why, and what if: how a player performs in a specific match situation, not just on average.',
    users: 'Cricket analysts, scouts and serious fans exploring players, squads and match situations.', // TODO verify
    contribution: 'Solo founder build: data pipeline, statistical methodology, product design, front end, back end and deployment.',
    focus: ['Cricket data engineering', 'Situational analytics', 'Statistical methodology', 'Scouting and decision-support tools', 'End-to-end product ownership'],
    decisions: [
      'Rank players inside a situation the user defines (Pressure Lab) instead of flat career averages.',
      'Build on Cricsheet’s open ball-by-ball data (ODC-BY 1.0) so every number traces back to a public source.',
      'Serve production pages from committed static JSON, keeping the live site fast and cheap to host.',
    ],
    tech: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'TanStack Query', 'Recharts', 'Express', 'SQLite', 'Drizzle ORM', 'Python', 'Playwright'],
    evidence: [
      'Warehouse of 1,243 IPL matches (2008–2026) built from Cricsheet ball-by-ball data — per the repo README.',
      'Scout covers a multi-league warehouse: IPL, SMAT, BBL, CPL, SA20, ILT20 and men’s T20Is — per the repo README.',
    ],
    limitations: ['No published accuracy evaluation of the situational metrics yet.'],
    features: [
      'Pressure Lab: define a match situation, rank players by how they perform in it',
      'Scout Lab: discover players and compare roles',
      'Auction room: purse, slots and the player pool',
      'Squad HQ: retentions, releases and squad building',
      'Match Lab: playing XI and tactics',
      'Venue Atlas: grounds, conditions and history',
    ],
    capabilities: ['engineering', 'data', 'product'],
    oneLiner: 'IPL analytics, scouting and a Pressure Lab that ranks players in situations you define.',
    research: [],
    implementation: [
      'Ingest Cricsheet ball-by-ball data into a local SQLite warehouse (Drizzle ORM over node:sqlite).',
      'Express 5 API with zod validation; React 19 + Vite front end with TanStack Query and Recharts.',
      'Python for model fitting and some data scripts; an LP solver (javascript-lp-solver) in the stack.',
      'Production pages read committed static JSON; Playwright for end-to-end tests. (All per the repo README.)',
    ],
    lessons: [],
  },
  {
    key: 'hiremap',
    name: 'HireMap',
    title: 'AI-assisted Career Platform',
    kind: 'Team build · my part: front end',
    image: '/projects/hiremap.jpg',
    imageAlt: 'HireMap toolbox: AI resume builder, cover letter, ATS checker, career map and job matching',
    live: 'https://hiremap-eight.vercel.app/',
    code: '',
    caseStudy: '',
    status: 'live-team',
    statusLabel: 'Live · team project',
    problem: 'Students juggle half a dozen tools — résumé builders, ATS checkers, job boards — to apply for a single role.',
    users: 'Students and early-career job seekers; separate portals for companies and colleges.',
    contribution: 'I worked on the front end: React and TypeScript components for the career-discovery, résumé and ATS workflows, with Firebase.',
    teamNote: 'HireMap was built by a team. The AI features, matching logic and back end are the team’s shared work — I don’t claim them as mine.',
    focus: ['Frontend development', 'React and TypeScript', 'Career discovery workflows', 'ATS and résumé-related user experiences', 'Team collaboration'],
    decisions: [],
    tech: ['React', 'TypeScript', 'Firebase'],
    evidence: [],
    limitations: [],
    features: [
      'AI resume builder with ATS-friendly templates',
      'ATS checker with keyword fixes',
      'Cover letter generator',
      'Job matching with a skill-match score',
      'Career map and role roadmaps',
      'Portals for companies and colleges',
    ],
    capabilities: ['engineering', 'ai'],
    oneLiner: 'Résumé builder, ATS checker, cover letters and job matching in one place. My part: the front end.',
    research: [],
    implementation: [],
    lessons: [],
  },
  {
    key: 'cinephile',
    name: 'Cinephile',
    title: 'CineVerse · Entertainment Intelligence',
    kind: 'Concept, research and build',
    image: '/projects/cinephile.jpg',
    imageAlt: 'CineVerse home: “Two screens. One story.” over a cinema hall',
    live: 'https://cinephile-theatre.vercel.app/',
    code: '',
    caseStudy: '',
    status: 'prototype',
    statusLabel: 'Live prototype · illustrative data',
    problem: 'A film can win in cinemas and struggle on streaming. I wanted to model why: release windows, campaign spend and audience behaviour.',
    users: 'People studying the film business: marketers, distributors and curious film fans.', // TODO verify
    contribution: 'Concept, market research, financial scenario design and build.',
    focus: ['Film market intelligence', 'Theatrical and OTT economics', 'Revenue and ROI modelling', 'Marketing and GTM strategy', 'Audience understanding'],
    decisions: [],
    tech: [],
    evidence: [],
    limitations: [
      'Box-office, OTT and ROI figures are estimated scenarios for exploration — not audited financial records.',
      'Live data integrations are incomplete; parts of the site run on curated sample data.',
    ],
    features: [
      'Film Universe: films, directors, composers and studios',
      'Craft Lab: StoryDNA, FrameLab, CutLab and SoundLab',
      'Campaign War Room: GTM plans and a budget simulator',
      'Projection Lab: theatre vs streaming and release windows',
      'Producer’s Office: greenlight risk, release clashes, window wars',
      'Cinema Journal: essays and box-office post-mortems',
    ],
    capabilities: ['business', 'data', 'creative'],
    oneLiner: 'Release windows, campaign war rooms and theatre-vs-OTT economics, modelled as scenarios.',
    research: [],
    implementation: [],
    lessons: [],
  },
];

export const projectByKey = (k: string) => projects.find((p) => p.key === k);
