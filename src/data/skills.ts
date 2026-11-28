/* INSIDE MY TOOLKIT — skills grouped by what they let me do, never a wall of logos.
   evidence: keys from projects.ts or experience.ts (or 'portfolio' for this site).
   A skill with evidence renders as "shown in …"; without evidence it renders plain.
   Mark status: 'learning' for anything I'm currently picking up — it renders in its own style. */

export type Skill = { name: string; evidence?: string[]; status?: 'learning' };
export type SkillGroup = { key: string; title: string; line: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    key: 'programming',
    title: 'Programming & computer science',
    line: 'The languages I think in.',
    skills: [
      { name: 'TypeScript', evidence: ['cricfield', 'hiremap', 'portfolio'] },
      { name: 'Python', evidence: ['cricfield'] },
      { name: 'SQL', evidence: ['cricfield'] },
    ],
  },
  {
    key: 'software',
    title: 'Software development',
    line: 'From API to deployed screen.',
    skills: [
      { name: 'React', evidence: ['cricfield', 'hiremap'] },
      { name: 'Next.js', evidence: ['portfolio'] },
      { name: 'Node.js & Express', evidence: ['cricfield'] },
      { name: 'Firebase', evidence: ['hiremap'] },
      { name: 'Tailwind CSS', evidence: ['cricfield', 'portfolio'] },
      { name: 'End-to-end testing (Playwright)', evidence: ['cricfield'] },
    ],
  },
  {
    key: 'data-engineering',
    title: 'Data engineering',
    line: 'Getting messy data into shape.',
    skills: [
      { name: 'Ball-by-ball data ingestion', evidence: ['cricfield'] },
      { name: 'Data modelling', evidence: ['cricfield'] },
      { name: 'SQLite & Drizzle ORM', evidence: ['cricfield'] },
      { name: 'ETL pipelines', evidence: ['cricfield'] },
    ],
  },
  {
    key: 'analytics',
    title: 'Analytics & statistics',
    line: 'Numbers that lead to a decision.',
    skills: [
      { name: 'Situational metrics', evidence: ['cricfield'] },
      { name: 'Statistical methodology', evidence: ['cricfield'] },
      { name: 'Data visualization', evidence: ['cricfield'] },
      { name: 'Scenario modelling', evidence: ['cinephile'] },
    ],
  },
  {
    key: 'ai',
    title: 'AI & machine learning',
    line: 'Useful, and checked.',
    skills: [
      { name: 'Model fitting in Python', evidence: ['cricfield'] },
      { name: 'Machine learning', evidence: ['cseart'] },
      { name: 'LLM integrations', evidence: ['cseart'] },
      { name: 'Evaluation', evidence: ['cseart'] },
      { name: 'Audio data annotation', evidence: ['annotation'] },
    ],
  },
  {
    key: 'electronics',
    title: 'Electronics & embedded systems',
    line: 'Where software meets the physical world.',
    skills: [
      { name: 'Circuits', evidence: ['btech'] },
      { name: 'Microcontrollers' },
      { name: 'Embedded systems' },
      { name: 'Signals & sensors' },
    ],
  },
  {
    key: 'product',
    title: 'Product management',
    line: 'Deciding what is worth building.',
    skills: [
      { name: 'Product ownership', evidence: ['cricfield', 'kalakshetra'] },
      { name: 'Problem discovery', evidence: ['cricfield'] },
      { name: 'Prioritization', evidence: ['cricfield'] },
      { name: 'Product requirements (PRDs)' },
      { name: 'Product metrics & experimentation' },
    ],
  },
  {
    key: 'business',
    title: 'Business & growth',
    line: 'Connecting work to value.',
    skills: [
      { name: 'Market intelligence', evidence: ['cinephile'] },
      { name: 'Revenue & ROI modelling', evidence: ['cinephile'] },
      { name: 'GTM strategy', evidence: ['cinephile', 'kalakshetra'] },
      { name: 'Audience strategy', evidence: ['kalakshetra'] },
      { name: 'SEO', evidence: ['freelance'] },
    ],
  },
  {
    key: 'creative',
    title: 'Design & creative communication',
    line: 'Making ideas land.',
    skills: [
      { name: 'Writing & storytelling', evidence: ['sahitya'] },
      { name: 'Songwriting', evidence: ['sahitya'] },
      { name: 'Video editing', evidence: ['freelance'] },
      { name: 'Visual & interaction design', evidence: ['portfolio'] },
    ],
  },
];
