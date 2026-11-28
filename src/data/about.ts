/* ABOUT — copy for /about. Everything marked DRAFT was written for you to edit or replace in
   your own words before launch; it makes no factual claims beyond your profile. */

export const began = [
  // DRAFT
  'Electronics taught me how systems behave; software let me build my own. Cricket, cinema and music are where most of my questions come from.',
];

export const howIThink = [
  // DRAFT — rewrite in your own words
  { label: 'Learning', text: 'I learn by building something real and shipping it, then reading what I got wrong.' },
  { label: 'Problem-solving', text: 'Start from the user’s problem and the decision it should change; only then pick the tools.' },
  { label: 'Collaboration', text: 'Be clear about what is mine and what is the team’s, and make the hand-offs easy.' },
  { label: 'Creativity', text: 'Storytelling is how an idea survives the meeting. I treat it as a working skill.' },
];

/** your own principles. Empty = the section shows a "coming soon" line. */
export const beliefs: string[] = [];

/* ---- Recruiter view ------------------------------------------------------------
   Everything below only REFERENCES other data files; nothing here is a new claim. */

/** the eight toolkit cards on /about — each pulls its skill lines from skills.ts groups */
export const toolkitCards: { title: string; icon: string; groups: string[] }[] = [
  { title: 'Programming & CS', icon: 'laptop', groups: ['programming'] },
  { title: 'Software Development', icon: 'code', groups: ['software'] },
  { title: 'Data & Analytics', icon: 'chart', groups: ['analytics', 'data-engineering'] },
  { title: 'AI & ML', icon: 'sparkle', groups: ['ai'] },
  { title: 'Electronics & Embedded', icon: 'chip', groups: ['electronics'] },
  { title: 'Product & Management', icon: 'box', groups: ['product'] },
  { title: 'Business & Growth', icon: 'growth', groups: ['business'] },
  { title: 'Writing, Design & Communication', icon: 'pen', groups: ['creative'] },
];

/** "Recruiters usually ask…" — each answer is assembled from capabilities.ts / experience.ts / profile.ts */
export const recruiterQuestions: { q: string; capability?: string; experience?: string[]; profile?: 'availability' }[] = [
  { q: 'Can he build something end to end?', capability: 'engineering' },
  { q: 'Has he worked with real data?', capability: 'data' },
  { q: 'Where has he shown ownership?', capability: 'product', experience: ['sahitya', 'kalakshetra'] },
  { q: 'Any professional experience?', experience: ['cseart', 'annotation', 'freelance'] },
  { q: 'How does he use AI?', capability: 'ai' },
  { q: 'When can he start?', profile: 'availability' },
];
