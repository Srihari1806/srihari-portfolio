import type { Metadata } from 'next';
import { AboutPage } from '@/components/about/AboutPage';

export const metadata: Metadata = {
  title: 'About — Beesetti Srihari | Data-driven Product Builder',
  description:
    'Electronics & Computer Science undergraduate (KIIT, class of 2027) from Visakhapatnam. Experience, ventures, how I think, and where to find me.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <AboutPage />;
}
