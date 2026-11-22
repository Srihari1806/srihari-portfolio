// The 2 km case-study carousel. Exactly 10 slots — edit titles, copy and links here.
//
// status:
//   'published'   → card links to `url` (url required)
//   'in-research' → shows "In research", no link
//   'coming-soon' → shows "Coming soon", no link
// A card only becomes a link when status is 'published' AND url is filled in.
// cover: optional image path (e.g. '/case-studies/cricket.jpg'); empty = a drawn cover in the trip's palette.

export type StudyStatus = 'published' | 'in-research' | 'coming-soon';
export type CaseStudy = {
  n: number;
  title: string;
  description: string;
  category: string;
  status: StudyStatus;
  cover: string;
  url: string;
};

export const caseStudies: CaseStudy[] = [
  {
    n: 1,
    title: 'Cricket Platforms',
    description: 'Cricbuzz vs ESPNcricinfo vs CricField: who each one serves, and where they fall short.',
    category: 'Sports',
    status: 'in-research',
    cover: '',
    url: '',
  },
  {
    n: 2,
    title: 'OTT vs Theatre',
    description: 'Why a film can win in cinemas and struggle on streaming: content, audience and the release window.',
    category: 'Entertainment',
    status: 'in-research',
    cover: '',
    url: '',
  },
  {
    n: 3,
    title: 'Music Discovery',
    description: 'Spotify and creator communities: how independent artists get found, and what algorithms miss.',
    category: 'Music',
    status: 'in-research',
    cover: '',
    url: '',
  },
  {
    n: 4,
    title: 'E-commerce',
    description: 'Discovery and conversion: how shoppers move from browsing to buying.',
    category: 'Commerce',
    status: 'in-research',
    cover: '',
    url: '',
  },
  ...[5, 6, 7, 8, 9, 10].map((n) => ({
    n,
    title: 'Reserved',
    description: 'A slot for the next study. The car is still asking questions.',
    category: 'Future study',
    status: 'coming-soon' as StudyStatus,
    cover: '',
    url: '',
  })),
];
