import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Notes } from '@/components/home/sections/Notes';

export const metadata: Metadata = {
  title: 'Notes & case studies — Beesetti Srihari',
  description: 'Product case studies, PRDs, data analysis, cricket research and cinema business notes. Drafts and research are labelled.',
  alternates: { canonical: '/writing' },
};

export default function Writing() {
  return (
    <PageShell className="nt-page">
      <Notes index="✎" />
    </PageShell>
  );
}
