/* CURIOSITY LAB — the experiment directory.
   Status rules: 'completed' = finished and documented; 'prototype' = works in the browser now;
   'in-progress' = partly built or documented; 'planned' = not built yet. Never promote a planned
   experiment. `instrument` is the object in the room that opens it (deep link: /lab?exp=<id>). */

export type ExpStatus = 'completed' | 'prototype' | 'in-progress' | 'planned';
export type Instrument = 'crt' | 'scope' | 'breadboard' | 'monitor' | 'wall' | 'notebook' | 'server';

export type Experiment = {
  id: string;
  title: string;
  domain: 'Electronics & Embedded Systems' | 'Software Engineering' | 'Data Engineering' | 'Analytics' | 'Applied AI' | 'Systems Architecture' | 'Research Journal';
  status: ExpStatus;
  instrument: Instrument;
  skills: string[];
  summary: string;
  source?: { label: string; href: string };
  docs?: string;
  roles: string[];
};

export const STATUS_TEXT: Record<ExpStatus, string> = {
  completed: 'Completed',
  prototype: 'Prototype',
  'in-progress': 'In progress',
  planned: 'Planned',
};

const SITE_REPO = 'https://github.com/Srihari1806/srihari-portfolio';
const CRIC_REPO = 'https://github.com/CRICFIELD-INTELLIGENGE/IPL-ANALYTICAL-ENGINE';

export const experiments: Experiment[] = [
  {
    id: 'terminal',
    title: 'CURIOSITY OS — a safe command interpreter',
    domain: 'Software Engineering',
    status: 'prototype',
    instrument: 'crt',
    skills: ['TypeScript', 'Parsing', 'Canvas rendering', 'Keyboard UX'],
    summary: 'A browser-only shell on the CRT: commands, history, completion and a sorting visualizer. No real shell access.',
    source: { label: 'Portfolio repo', href: SITE_REPO },
    roles: ['software'],
  },
  {
    id: 'dsp',
    title: 'Signal bench: generate, add noise, filter, FFT',
    domain: 'Electronics & Embedded Systems',
    status: 'prototype',
    instrument: 'scope',
    skills: ['Signal generation', 'IIR filtering', 'FFT', 'Sampling'],
    summary: 'Sine, square, triangle, sawtooth and a synthetic sonar ping, computed live, with a low-pass filter and a frequency spectrum.',
    source: { label: 'Portfolio repo', href: SITE_REPO },
    roles: ['ai', 'data', 'software'],
  },
  {
    id: 'embedded',
    title: 'Breadboard basics: blink, button, PWM',
    domain: 'Electronics & Embedded Systems',
    status: 'prototype',
    instrument: 'breadboard',
    skills: ['GPIO', 'PWM', 'Arduino C++'],
    summary: 'Three classic circuits you can power, press and dim — with the code that would run them. A visual demo, not a circuit simulator.',
    source: { label: 'Portfolio repo', href: SITE_REPO },
    roles: ['software'],
  },
  {
    id: 'architecture',
    title: 'Architecture wall: how CricField is built',
    domain: 'Systems Architecture',
    status: 'prototype',
    instrument: 'wall',
    skills: ['System design', 'Data pipelines', 'APIs'],
    summary: 'Clickable diagrams built only from the CricField repository README. HireMap shows my front-end slice; Cinephile is not documented yet.',
    source: { label: 'CricField repo', href: CRIC_REPO },
    roles: ['software', 'data', 'product'],
  },
  {
    id: 'request-flow',
    title: 'Request-flow explorer',
    domain: 'Software Engineering',
    status: 'prototype',
    instrument: 'server',
    skills: ['HTTP', 'Caching', 'Databases'],
    summary: 'An educational simulation of Browser → API → Cache → Database → Response. Not a picture of any deployed system.',
    roles: ['software'],
  },
  {
    id: 'cricfield-pipeline',
    title: 'CricField data pipeline',
    domain: 'Data Engineering',
    status: 'in-progress',
    instrument: 'monitor',
    skills: ['Ingestion', 'SQLite', 'Data modelling'],
    summary: 'Raw Cricsheet match files → warehouse → API → analytics. Stages are documented from the README; schema walkthrough is next.',
    source: { label: 'CricField repo', href: CRIC_REPO },
    roles: ['data', 'product'],
  },
  {
    id: 'sql-playground',
    title: 'SQL playground on a labelled sample dataset',
    domain: 'Analytics',
    status: 'planned',
    instrument: 'monitor',
    skills: ['SQL'],
    summary: 'Read-only queries over a small, clearly labelled dataset.',
    roles: ['data'],
  },
  {
    id: 'pressure-lab',
    title: 'Pressure Lab: how the situational ranking works',
    domain: 'Analytics',
    status: 'planned',
    instrument: 'monitor',
    skills: ['Statistics'],
    summary: 'A worked breakdown of the method behind CricField’s situational rankings, once it is written up.',
    roles: ['data', 'product'],
  },
  {
    id: 'ml-demo',
    title: 'A small ML model you can tune',
    domain: 'Applied AI',
    status: 'planned',
    instrument: 'monitor',
    skills: ['Machine learning', 'Evaluation'],
    summary: 'Adjustable parameters with real computed results on a public or synthetic dataset.',
    roles: ['ai'],
  },
  {
    id: 'rag-bench',
    title: 'RAG evaluation bench',
    domain: 'Applied AI',
    status: 'planned',
    instrument: 'monitor',
    skills: ['Retrieval', 'Evaluation'],
    summary: 'Question → retrieval → context → answer → evaluation, shown only with a working integration.',
    roles: ['ai'],
  },
  {
    id: 'journal',
    title: 'Things I Broke, Fixed & Learned',
    domain: 'Research Journal',
    status: 'in-progress',
    instrument: 'notebook',
    skills: ['Writing', 'Debugging'],
    summary: 'The research journal. Entries follow objective → hypothesis → method → results → lessons. First entries are being written.',
    roles: ['software', 'data', 'ai', 'product'],
  },
];

export const experimentById = (id: string | null) => experiments.find((e) => e.id === id) ?? null;
