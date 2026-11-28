/* MY JOURNEY SO FAR — the railway tickets on the homepage and /about.
   Only verified, approved descriptions go here. Empty arrays render nothing.
   Never add confidential company or defence-related detail. */

import { links } from './profile';

export type ExperienceKind = 'education' | 'work' | 'venture' | 'freelance' | 'next';

export type Experience = {
  key: string;
  period: string;
  /** used for the ticket stamp */
  year: string;
  title: string;
  org: string;
  kind: ExperienceKind;
  summary: string;
  responsibilities: string[];
  skills: string[];
  lessons: string[];
  link?: string;
  /** shown on the ticket when details are still being written */
  pending?: string;
};

export const experience: Experience[] = [
  {
    key: 'btech',
    period: '2023 – 2027',
    year: '2023',
    title: 'B.Tech — Electronics & Computer Science',
    org: 'KIIT University, Bhubaneswar',
    kind: 'education',
    summary: 'Engineering foundation across software, electronics and computing.',
    responsibilities: [],
    skills: [],
    lessons: [],
  },
  {
    key: 'sahitya',
    period: '2024 – Present',
    year: '2024',
    title: 'Founder',
    org: 'Sahitya Rachanalu',
    kind: 'venture',
    summary: 'Original lyrics, creative writing, songwriting and publishing.',
    link: links.sahitya,
    responsibilities: ['Writing and publishing original lyrics, poetry and songs'],
    skills: ['Writing', 'Storytelling', 'Publishing'],
    lessons: [],
  },
  {
    key: 'freelance',
    period: '2025',
    year: '2025',
    title: 'Freelance SEO Writer, Video Editor & Social Media Marketer',
    org: 'Independent',
    kind: 'freelance',
    summary: 'Digital content for news websites, social pages and creators.',
    responsibilities: ['SEO writing for news websites', 'Video editing and social content for pages and creators'],
    skills: ['SEO', 'Video editing', 'Social media marketing', 'Content writing'],
    lessons: [],
  },
  {
    key: 'kalakshetra',
    period: '2025 – Present',
    year: '2025',
    title: 'Founder & Product Lead',
    org: 'Kalakshetra',
    kind: 'venture',
    summary: 'Independent music venture: event concepts, artist partnerships and audience strategy.',
    link: links.kalakshetra,
    responsibilities: ['Event concepts', 'Artist partnerships', 'Audience strategy'],
    skills: ['Audience research', 'Partnerships', 'Branding', 'Product ownership'],
    lessons: [],
  },
  {
    key: 'annotation',
    period: 'Feb – Jun 2026',
    year: '2026',
    title: 'Freelance Music & Audio Annotation',
    org: 'Student Tribe · client: Straive',
    kind: 'freelance',
    summary: 'Contract music and audio annotation work, via Student Tribe for Straive.',
    responsibilities: [],
    skills: ['Audio annotation', 'Data labelling'],
    lessons: [],
    pending: 'Details being written up',
  },
  {
    key: 'cseart',
    period: 'Jul – Nov 2026',
    year: '2026',
    title: 'AI/ML Engineering Intern', // TODO confirm title — elsewhere recorded as "AI Product Engineer Intern"
    org: 'CSEART Technologies',
    kind: 'work',
    summary: 'AI/ML engineering internship. Public description limited to approved, non-confidential work.',
    responsibilities: [],
    skills: [],
    lessons: [],
    pending: 'Approved description coming soon',
  },
  {
    key: 'next',
    period: '2027',
    year: '2027',
    title: 'Next destination',
    org: 'Graduate career opportunities',
    kind: 'next',
    summary: 'Looking for graduate roles in data, software, applied AI and product.',
    responsibilities: [],
    skills: [],
    lessons: [],
  },
];
