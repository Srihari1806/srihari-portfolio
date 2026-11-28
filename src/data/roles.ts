/* ROLE FAMILIES — what a recruiter can "explore my portfolio for".
   A selection only re-orders and highlights; nothing is ever hidden.
   Shareable as /?for=<id>, e.g. /?for=data  (also accepted on /about). */

export type RoleId = 'data' | 'software' | 'ai' | 'product' | 'business';

export type RoleFamily = {
  id: RoleId;
  label: string;
  /** one line shown when the role is selected */
  focus: string;
  targetRoles: string[];
  /** project keys in priority order (see projects.ts) */
  projects: string[];
  /** capability keys in priority order (see capabilities.ts) */
  capabilities: string[];
  /** toolkit group keys in priority order (see skills.ts) */
  skills: string[];
  /** experience keys to highlight (see experience.ts) */
  experience: string[];
};

export const roleFamilies: RoleFamily[] = [
  {
    id: 'data',
    label: 'Data & Analytics',
    focus: 'CricField’s situational analytics and data model, plus Cinephile’s scenario analysis.',
    targetRoles: ['Data Analyst', 'Product Analyst', 'BI Analyst', 'Analytics Engineer', 'Data Engineer'],
    projects: ['cricfield', 'cinephile', 'hiremap'],
    capabilities: ['data', 'engineering', 'product'],
    skills: ['analytics', 'data-engineering', 'programming'],
    experience: ['cseart', 'annotation'],
  },
  {
    id: 'software',
    label: 'Software Engineering',
    focus: 'CricField’s full-stack build and my front-end work on the HireMap team.',
    targetRoles: ['Software Engineer', 'Backend Developer', 'Full-Stack Developer'],
    projects: ['cricfield', 'hiremap', 'cinephile'],
    capabilities: ['engineering', 'data', 'ai'],
    skills: ['software', 'programming', 'data-engineering'],
    experience: ['cseart', 'btech'],
  },
  {
    id: 'ai',
    label: 'Applied AI',
    focus: 'My CSEART internship and AI-assisted product workflows.',
    targetRoles: ['Applied AI Engineer', 'AI Engineer', 'ML Engineer'],
    projects: ['hiremap', 'cricfield', 'cinephile'],
    capabilities: ['ai', 'engineering', 'data'],
    skills: ['ai', 'programming', 'analytics'],
    experience: ['cseart', 'annotation'],
  },
  {
    id: 'product',
    label: 'Product Management',
    focus: 'Owning CricField end to end, and the product research behind it.',
    targetRoles: ['Associate Product Manager', 'Product Analyst', 'Technical Product Analyst'],
    projects: ['cricfield', 'cinephile', 'hiremap'],
    capabilities: ['product', 'data', 'business'],
    skills: ['product', 'analytics', 'business'],
    experience: ['kalakshetra', 'sahitya'],
  },
  {
    id: 'business',
    label: 'Business & Growth',
    focus: 'Cinephile’s market modelling, Kalakshetra’s audience strategy and freelance marketing.',
    targetRoles: ['Business Analyst', 'Growth Analyst', 'GTM Associate', 'E-commerce Analyst'],
    projects: ['cinephile', 'cricfield', 'hiremap'],
    capabilities: ['business', 'creative', 'product'],
    skills: ['business', 'analytics', 'creative'],
    experience: ['kalakshetra', 'freelance', 'sahitya'],
  },
];

export const roleById = (id: string | null | undefined) => roleFamilies.find((r) => r.id === id) ?? null;

/** order `items` by the role's priority list; unlisted items keep their order after the listed ones */
export function prioritise<T>(items: T[], order: string[] | undefined, key: (t: T) => string): T[] {
  if (!order?.length) return items;
  const rank = (t: T) => {
    const i = order.indexOf(key(t));
    return i === -1 ? order.length : i;
  };
  return [...items].sort((a, b) => rank(a) - rank(b));
}
