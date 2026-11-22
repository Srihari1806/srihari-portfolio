export type Mode = 'normal' | 'tfi';

export type Role =
  | 'Product Management'
  | 'Software Development'
  | 'Data Analytics'
  | 'UI/UX Design'
  | 'Marketing & Growth'
  | 'Creative Strategy';

export type PublicationPlatform = 'Substack' | 'Medium' | 'Notion' | 'X Articles';

export type ArticleCategory =
  | 'Product Management'
  | 'Technology & Development'
  | 'Data Analytics'
  | 'Marketing & Growth'
  | 'Cricket Intelligence'
  | 'Cinema & Culture'
  | 'Original Lyrics & Creative Writing';

export interface Article {
  id: string;
  title: string;
  platform: PublicationPlatform;
  category: ArticleCategory;
  description: string;
  coverImage?: string;
  publicationDate: string;
  readingTime: string;
  externalUrl: string;
  associatedProject?: string;
  relevantRoles: Role[];
  featured?: boolean;
}

export interface ProjectRolePerspective {
  role: Role;
  summary: string;
  keyResponsibilities: string[];
  problem: string;
  decisions: string[];
  implementation: string[];
  metrics: { label: string; value: string }[];
  deliverables: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  timeframe: string;
  featured: boolean;
  coverImage: string;
  category: string;
  primaryRole: Role;
  supportedRoles: Role[];
  perspectives: Record<Role, ProjectRolePerspective>;
  links: {
    github?: string;
    liveDemo?: string;
    notionPRD?: string;
    substackEssay?: string;
    mediumArticle?: string;
    xThread?: string;
  };
  techStack: string[];
  teluguQuote?: {
    telugu: string;
    englishTrans: string;
    context: string;
  };
}

export interface MovieRelease {
  id: string;
  title: string;
  director: string;
  hero: string;
  releaseDate: string;
  month: string;
  year: number;
  genre: string;
  status: 'Released' | 'Upcoming' | 'Watchlist';
  rating?: number;
  reviewSnippet?: string;
  posterColor: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  teluguTitle: string;
  role: 'Lyrics & Composition' | 'Lyricist' | 'Beat Production';
  mood: string;
  bpm: number;
  duration: string;
  streamingUrl: string;
  lyricsSnippet: {
    telugu: string;
    transliteration: string;
    translation: string;
  };
}
