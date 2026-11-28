import { links } from './profile';

/* WHAT I CARRY WITH ME — the six objects in the suitcase on the homepage.
   `projects` / `experience` keys link to projects.ts and experience.ts; the evidence link
   goes to the first item that exists. No ratings or percentages, by design. */

export type CapabilityKey = 'engineering' | 'data' | 'ai' | 'product' | 'business' | 'creative';

export type Capability = {
  key: CapabilityKey;
  object: string;
  title: string;
  /** handwritten tag on the object */
  note: string;
  contribution: string;
  skills: string[];
  projects: string[];
  /** free-text supporting work that isn't a project card (ventures, case studies) */
  alsoSeenIn: string[];
  experience: string[];
  evidenceHref: string;
  evidenceLabel: string;
};

export const capabilities: Capability[] = [
  {
    key: 'engineering',
    object: 'Laptop',
    title: 'Engineering',
    note: 'ships it',
    contribution: 'I can take a feature from schema to deployed screen: APIs, data models, front end and the plumbing between them.',
    skills: ['Software development', 'Backend systems', 'APIs', 'Databases', 'Application architecture'],
    projects: ['cricfield', 'hiremap'],
    alsoSeenIn: ['Technical experiments in the Lab'],
    experience: ['btech', 'cseart'],
    evidenceHref: '/work/cricfield',
    evidenceLabel: 'Open the CricField build',
  },
  {
    key: 'data',
    object: 'Analytics notebook',
    title: 'Data & Intelligence',
    note: 'asks why',
    contribution: 'I turn raw event data into metrics people can make decisions with — and I can explain how each number is built.',
    skills: ['SQL', 'Python', 'Statistics', 'Data modelling', 'Visualization', 'Analytical decision-making'],
    projects: ['cricfield', 'cinephile'],
    alsoSeenIn: ['CricField Pressure Lab', 'Player analysis', 'Cinephile revenue models'],
    experience: [],
    evidenceHref: '/lab#station-analytics',
    evidenceLabel: 'Visit the analytics station',
  },
  {
    key: 'ai',
    object: 'Circuit board',
    title: 'Applied AI',
    note: 'makes it useful',
    contribution: 'I build with machine learning and LLMs where they genuinely help, and I check that the output can be trusted.',
    skills: ['Machine learning', 'LLM integrations', 'Evaluation', 'Automation', 'Intelligent applications'],
    projects: ['hiremap'],
    alsoSeenIn: ['CSEART internship', 'AI experiments in the Lab'],
    experience: ['cseart', 'annotation'],
    evidenceHref: '/lab#station-ai',
    evidenceLabel: 'Visit the AI/ML station',
  },
  {
    key: 'product',
    object: 'Compass',
    title: 'Product Thinking',
    note: 'points somewhere',
    contribution: 'I start from the user’s problem, decide what not to build, and define how we’ll know it worked.',
    skills: ['Problem discovery', 'User research', 'Prioritization', 'Product requirements', 'Experimentation', 'Product metrics'],
    projects: ['cricfield'],
    alsoSeenIn: ['Product case studies (in research)', 'PRDs'],
    experience: ['kalakshetra'],
    evidenceHref: '/writing',
    evidenceLabel: 'Read the case studies',
  },
  {
    key: 'business',
    object: 'Travel ledger',
    title: 'Business & Growth',
    note: 'counts the cost',
    contribution: 'I connect a product to its market: who it’s for, how it reaches them, and whether the numbers add up.',
    skills: ['Market intelligence', 'GTM strategy', 'Audience research', 'SEO', 'Financial modelling', 'Growth analytics'],
    projects: ['cinephile'],
    alsoSeenIn: ['Kalakshetra', 'Freelance marketing work'],
    experience: ['kalakshetra', 'freelance'],
    evidenceHref: '/work/cinephile',
    evidenceLabel: 'Open Cinephile',
  },
  {
    key: 'creative',
    object: 'Headphones & lyric notebook',
    title: 'Creative Communication',
    note: 'tells the story',
    contribution: 'I make ideas land: writing, visuals and storytelling that help a team or an audience actually get it.',
    skills: ['Storytelling', 'Writing', 'Visual communication', 'Music', 'Content creation'],
    projects: [],
    alsoSeenIn: ['Sahitya Rachanalu', 'Original songs', 'Creative projects'],
    experience: ['sahitya', 'freelance'],
    evidenceHref: links.sahitya,
    evidenceLabel: 'Read Sahitya Rachanalu',
  },
];
