import type { Metadata } from 'next';
import { RoadTrip } from '@/components/roadtrip/RoadTrip';

export const metadata: Metadata = {
  title: 'Work — srihari. | You, me & a few wrong turns',
  description:
    'A road trip through what Srihari builds: CricField, cricket analytics, product thinking, creative work — and the receipts.',
};

export default function WorkPage() {
  return <RoadTrip />;
}
