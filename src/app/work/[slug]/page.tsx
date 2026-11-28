import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projectByKey, projects } from '@/data/projects';
import { ProjectPage } from '@/components/work/ProjectPage';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.key }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = projectByKey(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.title} | Beesetti Srihari`,
    description: `${p.problem} ${p.contribution}`,
    alternates: { canonical: `/work/${p.key}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const p = projectByKey(params.slug);
  if (!p) notFound();
  return <ProjectPage p={p} />;
}
