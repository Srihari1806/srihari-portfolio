/* ============================================================================
   PROFILE — the one place for who I am, how to reach me and which documents exist.
   Every other page reads from here. Rules for this file:
   - An empty string ('') means "not available": the site hides that link instead of faking it.
   - `resume.available` must stay false until /public/resume.pdf is the real résumé
     (today it is a one-line "Resume coming soon" placeholder).
   ========================================================================== */

export const profile = {
  name: 'Beesetti Srihari',
  shortName: 'Srihari',
  identity: 'Data-driven Product Builder',
  degree: 'B.Tech, Electronics & Computer Science',
  school: 'KIIT University, Bhubaneswar',
  graduation: 2027,
  location: 'Visakhapatnam, India',
  availability: 'Available for internships and graduate opportunities',
  interests: 'Data, Software, AI and Product',
  pillars: [
    { label: 'Engineering', line: 'is my foundation.' },
    { label: 'Analytics', line: 'is my intelligence.' },
    { label: 'Product thinking', line: 'is my direction.' },
    { label: 'Business understanding', line: 'connects my work to value.' },
    { label: 'Creativity', line: 'is my differentiator.' },
  ],
};

export const links = {
  email: 'sriharibeesetti@gmail.com',
  linkedin: '', // TODO add your LinkedIn profile URL
  github: 'https://github.com/Srihari1806',
  cricfield: 'https://www.cricfield.in/',
  sahitya: 'https://sahitya-rachanalu.vercel.app/',
  kalakshetra: 'https://band-premier-league.vercel.app/', // Kalakshetra / Band Premier League
  linktree: 'https://linktr.ee/Srihari1806', // songs & credits // Sahitya Rachanalu — letters, lyrics and late-night ink
  // publishing + creative profiles: fill in to show them in Notes and the footer
  notion: '',
  medium: '',
  substack: '',
  letterboxd: '',
  spotify: '',
  youtube: '',
  instagram: '',
};

/** Résumés. `general` is the default; role versions appear only when their file exists and `available` is true. */
export const resume = {
  available: false, // flip to true once /public/resume.pdf is the real document
  general: '/resume.pdf',
  byRole: {
    data: '', // e.g. '/resume/srihari-data-analytics.pdf'
    software: '',
    ai: '',
    product: '',
    business: '',
  } as Record<string, string>,
};

export const mailto = (subject?: string) =>
  `mailto:${links.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** where the "View résumé" button goes: the PDF when it is real, otherwise an email request */
export function resumeLink(roleId?: string | null) {
  if (!resume.available) return { href: mailto('Résumé request'), label: 'Request résumé', isFile: false };
  const specific = roleId ? resume.byRole[roleId] : '';
  return { href: specific || resume.general, label: specific ? 'View role résumé' : 'View résumé', isFile: true };
}
