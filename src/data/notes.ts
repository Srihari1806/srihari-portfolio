/* NOTES ALONG THE WAY — research and writing.
   Only published pieces (with a URL) or explicitly labelled drafts / research appear.
   Case studies live in ./caseStudies.ts and are pulled in automatically. */

import { caseStudies } from './caseStudies';
import { links } from './profile';

export type NoteCategory =
  | 'Product case studies'
  | 'Product requirements documents'
  | 'Technical articles'
  | 'Data analysis'
  | 'Cricket research'
  | 'Cinema business intelligence'
  | 'Growth and GTM strategy';

export const noteCategories: NoteCategory[] = [
  'Product case studies',
  'Product requirements documents',
  'Technical articles',
  'Data analysis',
  'Cricket research',
  'Cinema business intelligence',
  'Growth and GTM strategy',
];

export type Note = {
  title: string;
  category: NoteCategory;
  description: string;
  status: 'published' | 'draft' | 'in-research';
  url: string;
  platform?: string;
  date?: string;
};

/** Published pieces and explicit drafts. Add yours here. */
const written: Note[] = [];

const studyCategory: Record<string, NoteCategory> = {
  Sports: 'Cricket research',
  Entertainment: 'Cinema business intelligence',
  Music: 'Product case studies',
  Commerce: 'Growth and GTM strategy',
};

export const notes: Note[] = [
  ...written,
  ...caseStudies
    .filter((c) => c.status !== 'coming-soon')
    .map<Note>((c) => ({
      title: c.title,
      category: studyCategory[c.category] ?? 'Product case studies',
      description: c.description,
      status: c.status === 'published' ? 'published' : 'in-research',
      url: c.status === 'published' ? c.url : '',
    })),
].filter((n) => n.status !== 'published' || !!n.url);

export const publishingProfiles = [
  { label: 'Sahitya Rachanalu', href: links.sahitya },
  { label: 'Notion', href: links.notion },
  { label: 'Medium', href: links.medium },
  { label: 'Substack', href: links.substack },
  { label: 'LinkedIn', href: links.linkedin },
  { label: 'GitHub', href: links.github },
].filter((p) => !!p.href);
