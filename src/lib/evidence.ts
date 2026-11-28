import { experience } from '@/data/experience';
import { projects } from '@/data/projects';

/** a human label for an evidence key (project, experience or 'portfolio') */
export function evidenceLabel(key: string): string {
  if (key === 'portfolio') return 'this site';
  const p = projects.find((x) => x.key === key);
  if (p) return p.name;
  const short: Record<string, string> = { btech: 'B.Tech coursework', freelance: 'Freelance work', annotation: 'Student Tribe', cseart: 'CSEART internship' };
  if (short[key]) return short[key];
  const e = experience.find((x) => x.key === key);
  if (e) return e.org.split(' · ')[0];
  return key;
}

/** where an evidence key points on the homepage */
export function evidenceHref(key: string): string {
  if (key === 'portfolio') return '/';
  if (projects.some((x) => x.key === key)) return `/work/${key}`;
  if (experience.some((x) => x.key === key)) return `/about#ticket-${key}`;
  return '#';
}
