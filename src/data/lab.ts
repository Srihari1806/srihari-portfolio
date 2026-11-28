/* THE LAB — five workshop stations. Work shows what I built; the Lab shows how it works.
   Rules: only real, documented work. A station without a finished write-up is labelled
   "Work in progress" and says what is coming. CSEART demos must use public or synthetic data. */

export type StationStatus = 'documented' | 'partial' | 'in-progress';

export type Station = {
  key: 'software' | 'data' | 'analytics' | 'ai' | 'electronics';
  name: string;
  bench: string;
  status: StationStatus;
  summary: string;
  topics: string[];
  objective: string;
  methodology: string[];
  architecture: string[];
  code: { label: string; href: string }[];
  io: { inputs: string; outputs: string } | null;
  results: string[];
  limitations: string[];
  lessons: string[];
  /** what's coming, for stations still being written up */
  next?: string;
  source?: string;
};

const repo = 'https://github.com/CRICFIELD-INTELLIGENGE/IPL-ANALYTICAL-ENGINE';

export const stations: Station[] = [
  {
    key: 'software',
    name: 'Software Engineering',
    bench: 'Terminal & architecture board',
    status: 'partial',
    summary: 'How CricField is put together: a typed front end, an API and a database, shipped as a fast static site.',
    topics: ['APIs', 'Architecture', 'Databases', 'Testing', 'Deployment'],
    objective: 'Serve a multi-page cricket analytics product that stays fast and cheap to run.',
    methodology: [],
    architecture: [
      'React 19 + Vite front end, Tailwind CSS, wouter routing, TanStack Query, Recharts.',
      'Express 5 API with zod validation and pino logging.',
      'SQLite through node:sqlite with Drizzle ORM (sqlite-proxy).',
      'Production pages read committed static JSON instead of calling the API live.',
      'pnpm workspace, TypeScript 5.9, Playwright end-to-end tests.',
    ],
    code: [{ label: 'CricField repository', href: repo }],
    io: null,
    results: [],
    limitations: [],
    lessons: [],
    next: 'Architecture diagram and the API/schema walkthrough.',
    source: 'Stack as listed in the CricField repo README.',
  },
  {
    key: 'data',
    name: 'Data Engineering',
    bench: 'Pipes, tanks & a warehouse',
    status: 'partial',
    summary: 'Turning open ball-by-ball cricket data into a warehouse the product can query.',
    topics: ['Ingestion', 'Transformations', 'ETL', 'SQL', 'Data modelling'],
    objective: 'One reliable, traceable source for every number CricField shows.',
    methodology: [],
    architecture: [
      'Source: Cricsheet ball-by-ball data (ODC-BY 1.0).',
      'Local SQLite warehouse for IPL; a separate multi-league database for scouting.',
      'Export step writes static JSON for the production pages.',
    ],
    code: [{ label: 'CricField repository', href: repo }],
    io: {
      inputs: 'Cricsheet ball-by-ball match files, 2008–2026.',
      outputs: 'IPL warehouse of 1,243 matches; a multi-league warehouse (IPL, SMAT, BBL, CPL, SA20, ILT20, men’s T20Is); static JSON.',
    },
    results: [],
    limitations: [],
    lessons: [],
    next: 'Data-quality checks and the schema diagram.',
    source: 'Figures as stated in the CricField repo README.',
  },
  {
    key: 'analytics',
    name: 'Analytics',
    bench: 'Notebooks & a scoreboard',
    status: 'in-progress',
    summary: 'The Pressure Lab: ranking players inside a match situation you define, instead of by flat averages.',
    topics: ['Statistics', 'Situational metrics', 'Scenario analysis', 'Dashboards'],
    objective: 'Answer “who performs best in this situation?” rather than “who has the best average?”',
    methodology: [],
    architecture: [],
    code: [{ label: 'Try the Pressure Lab', href: 'https://www.cricfield.in/' }],
    io: { inputs: 'A user-defined match situation.', outputs: 'A ranked table of players for that situation.' },
    results: [],
    limitations: ['No published accuracy evaluation yet.'],
    lessons: [],
    next: 'The statistical method behind the rankings, with worked examples.',
  },
  {
    key: 'ai',
    name: 'AI / ML',
    bench: 'Model rack',
    status: 'in-progress',
    summary: 'Machine learning and LLM experiments: what works, how it was evaluated, and what it costs.',
    topics: ['Model fitting', 'LLM workflows', 'RAG', 'Evaluation', 'Latency & reliability'],
    objective: 'Show applied AI work with honest evaluation — built on public or synthetic data only.',
    methodology: [],
    architecture: [],
    code: [],
    io: null,
    results: [],
    limitations: [],
    lessons: [],
    next: 'Python model fitting from CricField, and demos from my CSEART internship rebuilt on public or synthetic data.',
  },
  {
    key: 'electronics',
    name: 'Electronics',
    bench: 'Oscilloscope & breadboard',
    status: 'in-progress',
    summary: 'Circuits, sensors, microcontrollers and signals — the hardware side of my degree.',
    topics: ['Breadboarding', 'Sensors', 'Microcontrollers', 'Signals', 'Embedded systems'],
    objective: 'Document hardware builds with schematics, code and measured results.',
    methodology: [],
    architecture: [],
    code: [],
    io: null,
    results: [],
    limitations: [],
    lessons: [],
    next: 'First documented build with schematic, firmware and scope captures.',
  },
];

export const STATUS_LABEL: Record<StationStatus, string> = {
  documented: 'Documented',
  partial: 'Partly documented',
  'in-progress': 'Work in progress',
};
