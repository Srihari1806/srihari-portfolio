/* Architecture wall — only what the sources say.
   CricField: every component below is listed in the CricField repository README. Arrows marked
   `inferred` connect documented components in the obvious way but are not spelled out in the README.
   HireMap: I can only document my own slice (React + TypeScript front end with Firebase); the rest
   was team-built. Cinephile: no verified architecture write-up yet, so nothing is drawn. */

export type ArchNode = {
  id: string;
  name: string;
  x: number; // 0..100 layout units
  y: number;
  purpose: string;
  tech: string[];
  inputs?: string;
  outputs?: string;
  limitations?: string;
  owner?: 'mine' | 'team';
  source?: string;
};
export type ArchEdge = { from: string; to: string; label?: string; inferred?: boolean };
export type ArchDiagram = { key: string; name: string; note: string; nodes: ArchNode[]; edges: ArchEdge[]; repo?: string };

const README = 'CricField repository README';

export const architectures: ArchDiagram[] = [
  {
    key: 'cricfield',
    name: 'CricField',
    note: 'Components as listed in the repository README. Dashed arrows are my reading of how documented parts connect.',
    repo: 'https://github.com/CRICFIELD-INTELLIGENGE/IPL-ANALYTICAL-ENGINE',
    nodes: [
      { id: 'cricsheet', name: 'Cricsheet data', x: 8, y: 30, purpose: 'Open ball-by-ball match data the whole product is built on.', tech: ['Cricsheet (ODC-BY 1.0)'], outputs: 'Match files covering 2008–2026', source: README },
      { id: 'python', name: 'Python scripts', x: 8, y: 72, purpose: 'Model fitting and some data scripts.', tech: ['Python'], source: README },
      { id: 'warehouse', name: 'SQLite warehouse', x: 36, y: 30, purpose: 'Local warehouse the analytics read from; a separate multi-league database powers Scout.', tech: ['SQLite (node:sqlite)', 'Drizzle ORM (sqlite-proxy)'], outputs: '1,243 IPL matches; IPL, SMAT, BBL, CPL, SA20, ILT20 and men’s T20Is for Scout', source: README },
      { id: 'api', name: 'API server', x: 64, y: 72, purpose: 'Typed server layer of the workspace.', tech: ['Express 5', 'zod', 'pino', 'javascript-lp-solver'], source: README },
      { id: 'json', name: 'Static JSON', x: 64, y: 30, purpose: 'What production pages read: committed static JSON files.', tech: ['JSON in artifacts/ipl-analytics/public/data/'], source: README },
      { id: 'ui', name: 'Analytics UI', x: 92, y: 30, purpose: 'Pressure Lab, Scout, Auction, Squad HQ, Match Lab, Venue Atlas.', tech: ['React 19', 'Vite 7', 'Tailwind CSS 4', 'wouter', 'TanStack Query', 'Recharts'], source: README },
      { id: 'tests', name: 'E2E tests', x: 92, y: 72, purpose: 'End-to-end testing of the app.', tech: ['Playwright', 'pnpm workspace', 'TypeScript 5.9'], source: README },
    ],
    edges: [
      { from: 'cricsheet', to: 'warehouse', label: 'derived from' },
      { from: 'python', to: 'warehouse', inferred: true },
      { from: 'warehouse', to: 'json', inferred: true },
      { from: 'json', to: 'ui', label: 'production reads' },
      { from: 'warehouse', to: 'api', inferred: true },
      { from: 'api', to: 'ui', inferred: true },
      { from: 'tests', to: 'ui', inferred: true },
    ],
  },
  {
    key: 'hiremap',
    name: 'HireMap',
    note: 'A team project. I can document only my part: the front end. Everything else is the team’s and is not drawn as mine.',
    nodes: [
      { id: 'fe', name: 'Front end (my part)', x: 30, y: 40, owner: 'mine', purpose: 'Career-discovery, résumé and ATS workflows as React components.', tech: ['React', 'TypeScript'] },
      { id: 'fb', name: 'Firebase', x: 70, y: 40, owner: 'team', purpose: 'Used by the app; the wider back-end setup was team work.', tech: ['Firebase'] },
      { id: 'ai', name: 'AI features & matching', x: 70, y: 78, owner: 'team', purpose: 'Built by the team. Not documented here.', tech: [] },
    ],
    edges: [
      { from: 'fe', to: 'fb' },
      { from: 'fe', to: 'ai', inferred: true },
    ],
  },
  {
    key: 'cinephile',
    name: 'Cinephile',
    note: 'No verified architecture write-up yet. Rather than guess, this blueprint stays blank until it is documented.',
    nodes: [],
    edges: [],
  },
];
