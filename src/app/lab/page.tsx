import type { Metadata } from 'next';
import { LabExperience } from '@/components/lab/LabExperience';

export const metadata: Metadata = {
  title: 'Curiosity Lab — Beesetti Srihari | Built it. Broke it. Understood it.',
  description:
    'An interactive engineering room: a working retro terminal, an oscilloscope with real signal processing, an architecture wall and breadboard demos — with an experiment directory for quick reading.',
  alternates: { canonical: '/lab' },
};

export default function Page() {
  return <LabExperience />;
}
